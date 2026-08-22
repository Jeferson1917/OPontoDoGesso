'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

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

    const delivery = await prisma.truckDelivery.create({
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

    revalidatePath('/admin/estoque');
    return { success: true, delivery, realCostPerKg };
  } catch (error) {
    console.error('Erro ao registrar caminhão:', error);
    return { success: false, error: 'Falha ao registrar carga no banco de dados.' };
  }
}

export async function registerCounterSaleAction(data: {
  customerName?: string;
  itemKey: string;
  quantity: number;
  unitPrice: number;
  estimatedProfit: number;
}) {
  try {
    const totalValue = data.quantity * data.unitPrice;

    const sale = await prisma.counterSale.create({
      data: {
        customerName: data.customerName || 'Gesseiro no Balcão',
        itemKey: data.itemKey,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalValue,
        estimatedProfit: data.estimatedProfit,
      },
    });

    revalidatePath('/admin/estoque');
    return { success: true, sale };
  } catch (error) {
    console.error('Erro ao registrar venda de balcão:', error);
    return { success: false, error: 'Falha ao salvar a venda no banco de dados.' };
  }
}

export async function getStockMovementsAction() {
  try {
    const [deliveries, sales] = await Promise.all([
      prisma.truckDelivery.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.counterSale.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    return { success: true, deliveries, sales };
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return { success: false, error: 'Erro ao buscar histórico de estoque.' };
  }
}