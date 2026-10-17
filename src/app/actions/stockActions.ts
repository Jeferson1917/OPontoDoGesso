'use server';

import { prisma, toNumber } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAdminSession, unauthorized } from '../../lib/auth';
import { Prisma } from '@prisma/client';
import { splitTruckCosts, weightedAverageCost } from '../utils/truckCost';

// Neon tem latência alta; o timeout padrão de 5s das transações é curto
const STOCK_TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };
const CONFLICT_MESSAGE = 'Outra alteração de estoque estava em andamento. Tente novamente.';

// Erro de regra de negócio da venda: a mensagem vai direto para a tela
class SaleError extends Error {}

const isTransactionConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2028' || error.code === 'P2034');

const defaultStockItems = [
  { itemKey: 'gessoPoKg', name: 'Gesso em Pó Tradicional', unit: 'kg', currentQuantity: 8000, minThreshold: 2500, averageUnitCost: 0.65, counterSalePrice: 1.10 },
  { itemKey: 'placaGesso60x60', name: 'Placa de Gesso 60x60cm', unit: 'unidades', currentQuantity: 1200, minThreshold: 400, averageUnitCost: 2.80, counterSalePrice: 4.80 },
  { itemKey: 'gessoColaKg', name: 'Gesso Cola', unit: 'kg', currentQuantity: 300, minThreshold: 80, averageUnitCost: 1.90, counterSalePrice: 3.50 },
  { itemKey: 'arameGalvanizadoKg', name: 'Arame Galvanizado nº 18', unit: 'kg', currentQuantity: 80, minThreshold: 25, averageUnitCost: 14.00, counterSalePrice: 22.00 },
  { itemKey: 'sisalKg', name: 'Sisal / Juta', unit: 'kg', currentQuantity: 60, minThreshold: 20, averageUnitCost: 9.50, counterSalePrice: 15.00 },
];

export async function getStockDataAction() {
  if (!(await getAdminSession())) return unauthorized();

  try {
    let balances = await prisma.stockBalance.findMany();

    // Se o banco estiver vazio pela primeira vez, popula os itens padrão
    if (balances.length === 0) {
      await prisma.stockBalance.createMany({ data: defaultStockItems });
      balances = await prisma.stockBalance.findMany();
    }

    const [deliveries, sales] = await Promise.all([
      prisma.truckDelivery.findMany({ orderBy: { createdAt: 'desc' }, take: 15 }),
      prisma.counterSale.findMany({ orderBy: { createdAt: 'desc' }, take: 15 }),
    ]);

    return { success: true, balances, deliveries, sales };
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    return { success: false, error: 'Falha ao carregar dados do estoque.' };
  }
}

export async function registerTruckDeliveryAction(data: {
  supplier: string;
  tonsGessoPo: number;
  platesQuantity: number;
  gessoCostTotal: number;
  platesCostTotal?: number;
  freightCost: number;
  unloadingLaborCost: number;
  notes?: string;
}) {
  if (!(await getAdminSession())) return unauthorized();

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
    return { success: true, realCostPerKg };
  } catch (error) {
    console.error('Erro ao registrar caminhão:', error);
    if (isTransactionConflict(error)) return { success: false, error: CONFLICT_MESSAGE };
    return { success: false, error: 'Falha ao registrar carga.' };
  }
}

export async function registerCounterSaleAction(data: {
  customerName?: string;
  itemKey: string;
  quantity: number;
  unitPrice: number;
}) {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const totalValue = data.quantity * data.unitPrice;

    await prisma.$transaction(async (tx) => {
      // Decremento condicional: atômico, duas vendas simultâneas não deixam o saldo negativo
      const { count } = await tx.stockBalance.updateMany({
        where: { itemKey: data.itemKey, currentQuantity: { gte: data.quantity } },
        data: { currentQuantity: { decrement: data.quantity } },
      });

      const item = await tx.stockBalance.findUnique({ where: { itemKey: data.itemKey } });
      if (!item) throw new SaleError('Item não cadastrado no estoque.');
      if (count === 0) {
        throw new SaleError(`Estoque insuficiente: ${item.name} tem ${item.currentQuantity.toLocaleString('pt-BR')} ${item.unit}.`);
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
    return { success: true };
  } catch (error) {
    if (error instanceof SaleError) return { success: false, error: error.message };
    console.error('Erro na venda:', error);
    if (isTransactionConflict(error)) return { success: false, error: CONFLICT_MESSAGE };
    return { success: false, error: 'Falha ao concluir venda.' };
  }
}