'use server';

import { prisma, toNumber, toPlain } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAdminSession, unauthorized } from '../../lib/auth';
import { z } from 'zod';
import { counterSaleSchema, idSchema, parseInput, stockAdjustmentSchema, truckDeliverySchema } from '../data/schemas';
import { Prisma } from '@prisma/client';
import { removeFromAverageCost, splitTruckCosts, weightedAverageCost } from '../utils/truckCost';
import { defaultStockItems } from '../data/defaultStock';

// Neon tem latência alta; o timeout padrão de 5s das transações é curto
const STOCK_TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };
const CONFLICT_MESSAGE = 'Outra alteração de estoque estava em andamento. Tente novamente.';

// Erro de regra de negócio do estoque: a mensagem vai direto para a tela
class StockError extends Error {}

const isTransactionConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2028' || error.code === 'P2034');

export async function getStockDataAction() {
  if (!(await getAdminSession())) return unauthorized();

  try {
    let balances = await prisma.stockBalance.findMany();

    // Se o banco estiver vazio pela primeira vez, popula os itens padrão
    if (balances.length === 0) {
      await prisma.stockBalance.createMany({ data: defaultStockItems });
      balances = await prisma.stockBalance.findMany();
    }

    const [deliveries, sales, adjustments] = await Promise.all([
      prisma.truckDelivery.findMany({ orderBy: { createdAt: 'desc' }, take: 15 }),
      prisma.counterSale.findMany({ orderBy: { createdAt: 'desc' }, take: 15 }),
      prisma.stockAdjustment.findMany({ orderBy: { createdAt: 'desc' }, take: 15 }),
    ]);

    return { success: true as const, balances: balances.map(toPlain), deliveries: deliveries.map(toPlain), sales: sales.map(toPlain), adjustments };
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    return { success: false as const, error: 'Falha ao carregar dados do estoque.' };
  }
}

export async function registerTruckDeliveryAction(input: z.input<typeof truckDeliverySchema>) {
  if (!(await getAdminSession())) return unauthorized();

  const parsed = parseInput(truckDeliverySchema, input);
  if (!parsed.ok) return { success: false as const, error: parsed.error };
  const data = parsed.data;

  try {
    const totalKg = data.tonsGessoPo * 1000;
    const split = splitTruckCosts({ ...data, platesCostTotal: data.platesCostTotal ?? 0 });
    const realCostPerKg = Number(split.costPerKg.toFixed(3));

    await prisma.$transaction(async (tx) => {
      // 1. Grava registro da entrega
      await tx.truckDelivery.create({
        data: {
          supplier: data.supplier,
          tonsGessoPo: data.tonsGessoPo,
          platesQuantity: data.platesQuantity,
          gessoCostTotal: data.gessoCostTotal,
          platesCostTotal: data.platesCostTotal ?? 0,
          freightCost: data.freightCost,
          unloadingLaborCost: data.unloadingLaborCost,
          realCostPerKg,
          notes: data.notes,
        },
      });

      // 2. Entrada no saldo + novo custo médio ponderado de cada item.
      // FOR UPDATE trava a linha: uma venda/baixa simultânea espera, em vez de ser sobrescrita pelo saldo lido aqui
      const entries = [
        { itemKey: 'gessoPoKg', qty: totalKg, cost: split.gessoTotalCost },
        { itemKey: 'placaGesso60x60', qty: data.platesQuantity, cost: split.platesTotalCost },
      ];
      for (const entry of entries) {
        if (!(entry.qty > 0)) continue;
        const [balance] = await tx.$queryRaw<{ currentQuantity: number; averageUnitCost: Prisma.Decimal }[]>`
          SELECT "currentQuantity", "averageUnitCost" FROM stock_balances WHERE "itemKey" = ${entry.itemKey} FOR UPDATE`;
        if (!balance) continue;
        // Sem custo informado (ex.: placas sem nota), só soma a quantidade e mantém o custo médio
        const newAvgCost = entry.cost > 0
          ? weightedAverageCost(balance.currentQuantity, toNumber(balance.averageUnitCost), entry.qty, entry.cost)
          : toNumber(balance.averageUnitCost);
        await tx.stockBalance.update({
          where: { itemKey: entry.itemKey },
          data: { currentQuantity: { increment: entry.qty }, averageUnitCost: Number(newAvgCost.toFixed(3)) },
        });
      }
    }, STOCK_TX_OPTIONS);

    revalidatePath('/admin');
    revalidatePath('/admin/estoque');
    return { success: true as const, realCostPerKg };
  } catch (error) {
    console.error('Erro ao registrar caminhão:', error);
    if (isTransactionConflict(error)) return { success: false as const, error: CONFLICT_MESSAGE };
    return { success: false as const, error: 'Falha ao registrar carga.' };
  }
}

export async function registerCounterSaleAction(input: z.input<typeof counterSaleSchema>) {
  if (!(await getAdminSession())) return unauthorized();

  const parsed = parseInput(counterSaleSchema, input);
  if (!parsed.ok) return { success: false as const, error: parsed.error };
  const data = parsed.data;

  try {
    const totalValue = data.quantity * data.unitPrice;

    await prisma.$transaction(async (tx) => {
      // Decremento condicional: atômico, duas vendas simultâneas não deixam o saldo negativo
      const { count } = await tx.stockBalance.updateMany({
        where: { itemKey: data.itemKey, currentQuantity: { gte: data.quantity } },
        data: { currentQuantity: { decrement: data.quantity } },
      });

      const item = await tx.stockBalance.findUnique({ where: { itemKey: data.itemKey } });
      if (!item) throw new StockError('Item não cadastrado no estoque.');
      if (count === 0) {
        throw new StockError(`Estoque insuficiente: ${item.name} tem ${item.currentQuantity.toLocaleString('pt-BR')} ${item.unit}.`);
      }

      const estimatedProfit = totalValue - (data.quantity * item.averageUnitCost);

      await tx.counterSale.create({
        data: {
          customerName: data.customerName || 'Gesseiro no Balcão',
          itemKey: data.itemKey,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalValue,
          estimatedProfit,
        },
      });
    }, STOCK_TX_OPTIONS);

    revalidatePath('/admin');
    revalidatePath('/admin/estoque');
    return { success: true as const };
  } catch (error) {
    if (error instanceof StockError) return { success: false as const, error: error.message };
    console.error('Erro na venda:', error);
    if (isTransactionConflict(error)) return { success: false as const, error: CONFLICT_MESSAGE };
    return { success: false as const, error: 'Falha ao concluir venda.' };
  }
}
// ---------------------------------------------------------------------------
// Correções: desfazer venda/carga e ajuste de inventário
// ---------------------------------------------------------------------------

export async function deleteCounterSaleAction(saleId: string) {
  if (!(await getAdminSession())) return unauthorized();
  const parsedId = parseInput(idSchema, saleId);
  if (!parsedId.ok) return { success: false as const, error: 'Venda inválida.' };

  try {
    await prisma.$transaction(async (tx) => {
      const sale = await tx.counterSale.findUnique({ where: { id: parsedId.data } });
      if (!sale) throw new StockError('Venda não encontrada.');
      // O material vendido volta para o estoque
      await tx.stockBalance.update({
        where: { itemKey: sale.itemKey },
        data: { currentQuantity: { increment: sale.quantity } },
      });
      await tx.counterSale.delete({ where: { id: sale.id } });
    }, STOCK_TX_OPTIONS);

    revalidatePath('/admin');
    revalidatePath('/admin/balcao');
    revalidatePath('/admin/estoque');
    return { success: true as const };
  } catch (error) {
    if (error instanceof StockError) return { success: false as const, error: error.message };
    console.error('Erro ao excluir venda:', error);
    if (isTransactionConflict(error)) return { success: false as const, error: CONFLICT_MESSAGE };
    return { success: false as const, error: 'Falha ao excluir a venda.' };
  }
}

export async function deleteTruckDeliveryAction(deliveryId: string) {
  if (!(await getAdminSession())) return unauthorized();
  const parsedId = parseInput(idSchema, deliveryId);
  if (!parsedId.ok) return { success: false as const, error: 'Carga inválida.' };

  try {
    await prisma.$transaction(async (tx) => {
      const delivery = await tx.truckDelivery.findUnique({ where: { id: parsedId.data } });
      if (!delivery) throw new StockError('Carga não encontrada.');

      const split = splitTruckCosts(delivery);
      const entries = [
        { itemKey: 'gessoPoKg', label: 'gesso em pó', qty: delivery.tonsGessoPo * 1000, cost: split.gessoTotalCost },
        { itemKey: 'placaGesso60x60', label: 'placas', qty: delivery.platesQuantity, cost: split.platesTotalCost },
      ];

      for (const entry of entries) {
        if (!(entry.qty > 0)) continue;
        const [balance] = await tx.$queryRaw<{ currentQuantity: number; averageUnitCost: Prisma.Decimal }[]>`
          SELECT "currentQuantity", "averageUnitCost" FROM stock_balances WHERE "itemKey" = ${entry.itemKey} FOR UPDATE`;
        if (!balance) continue;
        // Parte da carga já saiu (venda/obra): não dá para tirar o que não está mais no pátio
        if (balance.currentQuantity < entry.qty) {
          throw new StockError(
            `Não é possível excluir: o saldo de ${entry.label} (${balance.currentQuantity.toLocaleString('pt-BR')}) é menor que o da carga ` +
              `(${entry.qty.toLocaleString('pt-BR')}). Parte já foi usada — corrija com um ajuste de inventário.`
          );
        }
        // Desfaz a média ponderada: tira a quantidade e o custo que a carga tinha somado
        const newAvg = removeFromAverageCost(balance.currentQuantity, toNumber(balance.averageUnitCost), entry.qty, entry.cost);
        await tx.stockBalance.update({
          where: { itemKey: entry.itemKey },
          data: { currentQuantity: { decrement: entry.qty }, averageUnitCost: Number(newAvg.toFixed(3)) },
        });
      }

      await tx.truckDelivery.delete({ where: { id: delivery.id } });
    }, STOCK_TX_OPTIONS);

    revalidatePath('/admin');
    revalidatePath('/admin/estoque');
    return { success: true as const };
  } catch (error) {
    if (error instanceof StockError) return { success: false as const, error: error.message };
    console.error('Erro ao excluir carga:', error);
    if (isTransactionConflict(error)) return { success: false as const, error: CONFLICT_MESSAGE };
    return { success: false as const, error: 'Falha ao excluir a carga.' };
  }
}

export async function adjustStockAction(input: z.input<typeof stockAdjustmentSchema>) {
  if (!(await getAdminSession())) return unauthorized();
  const parsed = parseInput(stockAdjustmentSchema, input);
  if (!parsed.ok) return { success: false as const, error: parsed.error };
  const data = parsed.data;

  try {
    const adjustment = await prisma.$transaction(async (tx) => {
      const [balance] = await tx.$queryRaw<{ currentQuantity: number }[]>`
        SELECT "currentQuantity" FROM stock_balances WHERE "itemKey" = ${data.itemKey} FOR UPDATE`;
      if (!balance) throw new StockError('Item não cadastrado no estoque.');

      // O saldo passa a ser o contado; o custo médio não muda
      await tx.stockBalance.update({ where: { itemKey: data.itemKey }, data: { currentQuantity: data.countedQuantity } });
      return tx.stockAdjustment.create({
        data: {
          itemKey: data.itemKey,
          previousQuantity: balance.currentQuantity,
          newQuantity: data.countedQuantity,
          difference: Number((data.countedQuantity - balance.currentQuantity).toFixed(3)),
          reason: data.reason,
        },
      });
    }, STOCK_TX_OPTIONS);

    revalidatePath('/admin');
    revalidatePath('/admin/estoque');
    return { success: true as const, difference: adjustment.difference };
  } catch (error) {
    if (error instanceof StockError) return { success: false as const, error: error.message };
    console.error('Erro no ajuste de inventário:', error);
    if (isTransactionConflict(error)) return { success: false as const, error: CONFLICT_MESSAGE };
    return { success: false as const, error: 'Falha ao ajustar o estoque.' };
  }
}
