// src/app/actions/quoteActions.ts
'use server';

import { prisma, toPlain } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma, QuoteStatus } from '@prisma/client';
import { getQuoteStockQuantities, legacyStockQuantities, type StockQuantities } from '../utils/stockConsumption';
import { getAdminSession, unauthorized } from '../../lib/auth';
import { z } from 'zod';
import { createQuoteSchema, idSchema, parseInput, quoteStatusSchema } from '../data/schemas';
import { canChangeStatus, QUOTE_STATUS_LABELS } from '../data/quoteStatus';

export type CreateQuoteInput = z.input<typeof createQuoteSchema>;

export async function saveQuoteAction(input: CreateQuoteInput) {
  if (!(await getAdminSession())) return unauthorized();

  const parsed = parseInput(createQuoteSchema, input);
  if (!parsed.ok) return { success: false as const, error: parsed.error };
  const data = parsed.data;

  try {
    const newQuote = await prisma.quote.create({
      data: {
        clientName: data.clientName,
        clientPhone: data.clientPhone ?? null,
        totalAreaM2: data.totalAreaM2,
        suggestedFinalPrice: data.suggestedFinalPrice,
        finalAgreedPrice: data.finalAgreedPrice,
        discountApplied: data.discountApplied,
        roomsData: data.roomsData,
        materialsSnapshot: data.materialsSnapshot,
        notes: data.notes ?? null,
        status: 'PENDENTE',
        stockDeducted: false,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    return { success: true as const, quote: toPlain(newQuote) };
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    return { success: false as const, error: 'Falha ao salvar o orçamento no banco de dados.' };
  }
}

export async function getQuotesAction() {
  if (!(await getAdminSession())) return unauthorized();

  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      include: { payments: { orderBy: { paidAt: 'asc' } } },
    });
    return { success: true as const, quotes: quotes.map((q) => ({ ...toPlain(q), payments: q.payments.map(toPlain) })) };
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    return { success: false as const, error: 'Falha ao carregar lista de orçamentos.' };
  }
}

// Erro de regra de negócio do estoque: a mensagem vai direto para a tela
class QuoteStockError extends Error {}

const formatQty = (value: number) => Number(value.toFixed(2)).toLocaleString('pt-BR');

export async function updateQuoteStatusAction(id: string, status: QuoteStatus) {
  if (!(await getAdminSession())) return unauthorized();

  const parsedId = parseInput(idSchema, id);
  const parsedStatus = parseInput(quoteStatusSchema, status);
  if (!parsedId.ok || !parsedStatus.ok) return { success: false as const, error: 'Orçamento ou status inválido.' };

  try {
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return { success: false as const, error: 'Orçamento não encontrado.' };
    if (quote.status !== status && !canChangeStatus(quote.status, status)) {
      return { success: false as const, error: `Não é possível mudar de ${QUOTE_STATUS_LABELS[quote.status]} para ${QUOTE_STATUS_LABELS[status]}.` };
    }

    const isApprovedStatus = status === 'APROVADO' || status === 'EM_EXECUCAO' || status === 'CONCLUIDO';
    const shouldDeduct = isApprovedStatus && !quote.stockDeducted;
    const shouldRefund =
      (status === 'CANCELADO' || status === 'PENDENTE') && quote.stockDeducted;

    // Data de aprovação: preservada entre APROVADO/EM_EXECUCAO/CONCLUIDO, limpa se voltar a pendente ou cancelar
    const approvedAt = isApprovedStatus ? (quote.approvedAt ?? new Date()) : null;

    await prisma.$transaction(async (tx) => {
      // 1. Aplica a baixa no estoque com as mesmas quantidades do orçamento e grava o que saiu
      if (shouldDeduct) {
        const movement = getQuoteStockQuantities(quote.roomsData, quote.materialsSnapshot);
        const shortages: string[] = [];

        for (const [itemKey, qty] of Object.entries(movement)) {
          if (qty <= 0) continue;
          // Decremento condicional: atômico, nunca deixa o saldo negativo mesmo com aprovações simultâneas
          const { count } = await tx.stockBalance.updateMany({
            where: { itemKey, currentQuantity: { gte: qty } },
            data: { currentQuantity: { decrement: qty } },
          });
          if (count === 0) {
            const item = await tx.stockBalance.findUnique({ where: { itemKey } });
            shortages.push(
              item
                ? `${item.name} (tem ${formatQty(item.currentQuantity)} ${item.unit}, precisa ${formatQty(qty)})`
                : `${itemKey} (item não cadastrado no estoque)`
            );
          }
        }

        if (shortages.length > 0) {
          throw new QuoteStockError(`Estoque insuficiente: ${shortages.join('; ')}.`);
        }

        // Só marca como baixado se ainda não estava — evita baixa dupla em cliques simultâneos
        const { count } = await tx.quote.updateMany({
          where: { id, stockDeducted: false },
          data: { status, approvedAt, stockDeducted: true, stockMovement: movement },
        });
        if (count === 0) throw new QuoteStockError('Este orçamento já teve o estoque baixado. Atualize a página.');
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
        // Só estorna se ainda estava baixado — evita devolução dupla em cliques simultâneos
        const { count } = await tx.quote.updateMany({
          where: { id, stockDeducted: true },
          data: { status, approvedAt, stockDeducted: false, stockMovement: Prisma.DbNull },
        });
        if (count === 0) throw new QuoteStockError('Este orçamento já teve o estoque devolvido. Atualize a página.');
      }
      // 3. Apenas troca de status sem alterar estoque (ex: de APROVADO para EM_EXECUCAO)
      else {
        await tx.quote.update({
          where: { id },
          data: { status, approvedAt },
        });
      }
    }, { maxWait: 10_000, timeout: 20_000 }); // Neon tem latência alta; o padrão de 5s é curto

    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    revalidatePath('/admin/estoque');

    return {
      success: true as const,
      deducted: shouldDeduct,
      refunded: shouldRefund,
    };
  } catch (error) {
    if (error instanceof QuoteStockError) return { success: false as const, error: error.message };
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2028' || error.code === 'P2034')) {
      return { success: false as const, error: 'Outra alteração de estoque estava em andamento. Tente novamente.' };
    }
    console.error('Erro ao atualizar status e estoque:', error);
    return { success: false as const, error: 'Falha ao atualizar status e movimentar estoque.' };
  }
}

// Só orçamentos que não movimentaram estoque: pendentes ou cancelados (já devolvidos)
export async function deleteQuoteAction(id: string) {
  if (!(await getAdminSession())) return unauthorized();
  const parsedId = parseInput(idSchema, id);
  if (!parsedId.ok) return { success: false as const, error: 'Orçamento inválido.' };

  try {
    const { count } = await prisma.quote.deleteMany({
      where: { id: parsedId.data, stockDeducted: false, status: { in: ['PENDENTE', 'CANCELADO'] }, payments: { none: {} } },
    });
    if (count === 0) {
      return { success: false as const, error: 'Só é possível excluir orçamentos pendentes ou cancelados, sem material baixado do estoque e sem pagamentos lançados.' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    return { success: true as const };
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    return { success: false as const, error: 'Falha ao excluir o orçamento.' };
  }
}
