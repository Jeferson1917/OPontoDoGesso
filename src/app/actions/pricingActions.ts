'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../../lib/prisma';
import { getAdminSession, unauthorized } from '../../lib/auth';
import { STOCK_COST_SOURCES, sanitizePricingConfig, type PricingConfig } from '../data/pricingConfig';

const CONFIG_ID = 'global_config';

// isDefault indica que nada foi salvo ainda (usado para migrar o valor antigo do localStorage)
export async function getPricingConfigAction() {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const row = await prisma.pricingConfig.findUnique({ where: { id: CONFIG_ID } });
    return { success: true as const, config: sanitizePricingConfig(row ?? {}), isDefault: !row };
  } catch (error) {
    console.error('Erro ao carregar tabela de preços:', error);
    return { success: false as const, error: 'Falha ao carregar a tabela de preços.' };
  }
}

export async function savePricingConfigAction(input: PricingConfig) {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const config = sanitizePricingConfig(input);
    await prisma.pricingConfig.upsert({
      where: { id: CONFIG_ID },
      create: { id: CONFIG_ID, ...config },
      update: config,
    });
    revalidatePath('/admin/precos');
    revalidatePath('/admin/orcamento');
    return { success: true as const, config };
  } catch (error) {
    console.error('Erro ao salvar tabela de preços:', error);
    return { success: false as const, error: 'Falha ao salvar a tabela de preços.' };
  }
}

export async function resetPricingConfigAction() {
  if (!(await getAdminSession())) return unauthorized();

  try {
    await prisma.pricingConfig.deleteMany({ where: { id: CONFIG_ID } });
    revalidatePath('/admin/precos');
    revalidatePath('/admin/orcamento');
    return { success: true as const, config: sanitizePricingConfig({}) };
  } catch (error) {
    console.error('Erro ao restaurar tabela de preços:', error);
    return { success: false as const, error: 'Falha ao restaurar a tabela de preços.' };
  }
}

// Custo médio real de cada material que existe no estoque, já na unidade do orçamento
export async function getStockCostsAction() {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const balances = await prisma.stockBalance.findMany({ select: { itemKey: true, averageUnitCost: true } });
    const stockCosts: Partial<Record<keyof PricingConfig['materialCosts'], number>> = {};
    for (const [materialKey, source] of Object.entries(STOCK_COST_SOURCES)) {
      const balance = balances.find((b) => b.itemKey === source.itemKey);
      if (balance && balance.averageUnitCost > 0) {
        stockCosts[materialKey as keyof PricingConfig['materialCosts']] = Number((balance.averageUnitCost * source.factor).toFixed(2));
      }
    }
    return { success: true as const, stockCosts };
  } catch (error) {
    console.error('Erro ao carregar custos do estoque:', error);
    return { success: false as const, error: 'Falha ao carregar custos do estoque.' };
  }
}
