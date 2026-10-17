// src/app/actions/quoteActions.ts
'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma, QuoteStatus } from '@prisma/client';
import { getQuoteStockQuantities, legacyStockQuantities, type StockQuantities } from '../utils/stockConsumption';
import { getAdminSession, unauthorized } from '../../lib/auth';

export interface CreateQuoteInput {
  clientName: string;
  clientPhone?: string;
  totalAreaM2: number;
  suggestedFinalPrice: number;
  finalAgreedPrice: number;
  discountApplied: number;
  roomsData: any;
  materialsSnapshot: any;
  notes?: string;
}

export async function saveQuoteAction(data: CreateQuoteInput) {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const newQuote = await prisma.quote.create({
      data: {
        clientName: data.clientName,
        clientPhone: data.clientPhone || null,
        totalAreaM2: data.totalAreaM2,
        suggestedFinalPrice: data.suggestedFinalPrice,
        finalAgreedPrice: data.finalAgreedPrice,
        discountApplied: data.discountApplied,
        roomsData: data.roomsData,
        materialsSnapshot: data.materialsSnapshot,
        notes: data.notes || null,
        status: 'PENDENTE',
        stockDeducted: false,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    return { success: true, quote: newQuote };
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    return { success: false, error: 'Falha ao salvar o orçamento no banco de dados.' };
  }
}

export async function getQuotesAction() {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, quotes };
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    return { success: false, error: 'Falha ao carregar lista de orçamentos.' };
  }
}

export async function updateQuoteStatusAction(id: string, status: QuoteStatus) {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return { success: false, error: 'Orçamento não encontrado.' };

    const shouldDeduct =
      (status === 'APROVADO' || status === 'EM_EXECUCAO' || status === 'CONCLUIDO') &&
      !quote.stockDeducted;
    const shouldRefund =
      (status === 'CANCELADO' || status === 'PENDENTE') && quote.stockDeducted;

    await prisma.$transaction(async (tx) => {
      // 1. Aplica a baixa no estoque com as mesmas quantidades do orçamento e grava o que saiu
      if (shouldDeduct) {
        const movement = getQuoteStockQuantities(quote.roomsData, quote.materialsSnapshot);
        for (const [itemKey, qty] of Object.entries(movement)) {
          if (qty > 0) {
            await tx.stockBalance.update({
              where: { itemKey },
              data: { currentQuantity: { decrement: qty } },
            });
          }
        }
        await tx.quote.update({
          where: { id },
          data: { status, stockDeducted: true, stockMovement: movement },
        });
      }
      // 2. Estorna exatamente o que saiu; baixas antigas (sem stockMovement) usam a fórmula da época
      else if (shouldRefund) {
        const movement = (quote.stockMovement as StockQuantities | null) ?? legacyStockQuantities(quote.roomsData);
        for (const [itemKey, qty] of Object.entries(movement)) {
          if (qty > 0) {
            await tx.stockBalance.update({
              where: { itemKey },
              data: { currentQuantity: { increment: Number(qty.toFixed(2)) } },
            });
          }
        }
        await tx.quote.update({
          where: { id },
          data: { status, stockDeducted: false, stockMovement: Prisma.DbNull },
        });
      }
      // 3. Apenas troca de status sem alterar estoque (ex: de APROVADO para EM_EXECUCAO)
      else {
        await tx.quote.update({
          where: { id },
          data: { status },
        });
      }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    revalidatePath('/admin/estoque');

    return {
      success: true,
      deducted: shouldDeduct,
      refunded: shouldRefund,
    };
  } catch (error) {
    console.error('Erro ao atualizar status e estoque:', error);
    return { success: false, error: 'Falha ao atualizar status e movimentar estoque.' };
  }
}
