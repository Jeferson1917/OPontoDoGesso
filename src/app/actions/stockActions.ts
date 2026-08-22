'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

const defaultStockItems = [
  { itemKey: 'gessoPoKg', name: 'Gesso em Pó Tradicional', unit: 'kg', currentQuantity: 8000, minThreshold: 2500, averageUnitCost: 0.65, counterSalePrice: 1.10 },
  { itemKey: 'placaGesso60x60', name: 'Placa de Gesso 60x60cm', unit: 'unidades', currentQuantity: 1200, minThreshold: 400, averageUnitCost: 2.80, counterSalePrice: 4.80 },
  { itemKey: 'gessoColaKg', name: 'Gesso Cola', unit: 'kg', currentQuantity: 300, minThreshold: 80, averageUnitCost: 1.90, counterSalePrice: 3.50 },
  { itemKey: 'arameGalvanizadoKg', name: 'Arame Galvanizado nº 18', unit: 'kg', currentQuantity: 80, minThreshold: 25, averageUnitCost: 14.00, counterSalePrice: 22.00 },
  { itemKey: 'sisalKg', name: 'Sisal / Juta', unit: 'kg', currentQuantity: 60, minThreshold: 20, averageUnitCost: 9.50, counterSalePrice: 15.00 },
];

export async function getStockDataAction() {
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
  freightCost: number;
  unloadingLaborCost: number;
  notes?: string;
}) {
  try {
    const totalKg = data.tonsGessoPo * 1000;
    const totalSpent = data.gessoCostTotal + data.freightCost + data.unloadingLaborCost;
    const realCostPerKg = totalKg > 0 ? Number((totalSpent / totalKg).toFixed(3)) : 0.65;

    await prisma.$transaction(async (tx) => {
      // 1. Grava registro da entrega
      await tx.truckDelivery.create({
        data: {
          supplier: data.supplier,
          tonsGessoPo: data.tonsGessoPo,
          platesQuantity: data.platesQuantity,
          gessoCostTotal: data.gessoCostTotal,
          freightCost: data.freightCost,
          unloadingLaborCost: data.unloadingLaborCost,
          realCostPerKg,
          notes: data.notes,
        },
      });

      // 2. Atualiza saldo de gesso em pó e calcula novo custo médio
      const gessoBalance = await tx.stockBalance.findUnique({ where: { itemKey: 'gessoPoKg' } });
      if (gessoBalance) {
        const newQty = gessoBalance.currentQuantity + totalKg;
        const newAvgCost = Number((((gessoBalance.currentQuantity * gessoBalance.averageUnitCost) + totalSpent) / newQty).toFixed(3));
        await tx.stockBalance.update({
          where: { itemKey: 'gessoPoKg' },
          data: { currentQuantity: newQty, averageUnitCost: newAvgCost },
        });
      }

      // 3. Atualiza placas se vieram no caminhão
      if (data.platesQuantity > 0) {
        await tx.stockBalance.update({
          where: { itemKey: 'placaGesso60x60' },
          data: { currentQuantity: { increment: data.platesQuantity } },
        });
      }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/estoque');
    return { success: true, realCostPerKg };
  } catch (error) {
    console.error('Erro ao registrar caminhão:', error);
    return { success: false, error: 'Falha ao registrar carga.' };
  }
}

export async function registerCounterSaleAction(data: {
  customerName?: string;
  itemKey: string;
  quantity: number;
  unitPrice: number;
}) {
  try {
    const totalValue = data.quantity * data.unitPrice;

    await prisma.$transaction(async (tx) => {
      const item = await tx.stockBalance.findUnique({ where: { itemKey: data.itemKey } });
      if (!item || item.currentQuantity < data.quantity) {
        throw new Error('Estoque insuficiente para esta venda.');
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

      await tx.stockBalance.update({
        where: { itemKey: data.itemKey },
        data: { currentQuantity: { decrement: data.quantity } },
      });
    });

    revalidatePath('/admin');
    revalidatePath('/admin/estoque');
    return { success: true };
  } catch (error: any) {
    console.error('Erro na venda:', error);
    return { success: false, error: error.message || 'Falha ao concluir venda.' };
  }
}