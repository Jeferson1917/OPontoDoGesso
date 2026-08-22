// src/app/actions/quoteActions.ts
'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { QuoteStatus } from '@prisma/client';

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

// Extrator resiliente: calcula diretamente a partir das metragens se o snapshot estiver vazio
function calculateMaterialsFromRoomsOrSnapshot(roomsData: any, snapshot: any) {
  const totals: Record<string, number> = {
    gessoPoKg: 0,
    placaGesso60x60: 0,
    gessoColaKg: 0,
    arameGalvanizadoKg: 0,
    sisalKg: 0,
  };

  const addValues = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.gessoPoKg) totals.gessoPoKg += Number(obj.gessoPoKg) || 0;
    if (obj.placasGesso60x60) totals.placaGesso60x60 += Number(obj.placasGesso60x60) || 0;
    if (obj.placaGesso60x60) totals.placaGesso60x60 += Number(obj.placaGesso60x60) || 0;
    if (obj.gessoColaKg) totals.gessoColaKg += Number(obj.gessoColaKg) || 0;
    if (obj.arameGalvanizadoKg) totals.arameGalvanizadoKg += Number(obj.arameGalvanizadoKg) || 0;
    if (obj.sisalKg) totals.sisalKg += Number(obj.sisalKg) || 0;
  };

  // 1. Tenta extrair do snapshot
  if (snapshot) {
    if (snapshot.totalMaterials) {
      addValues(snapshot.totalMaterials);
    } else if (Array.isArray(snapshot)) {
      for (const item of snapshot) {
        addValues(item.materials || item);
      }
    } else if (snapshot.rooms && Array.isArray(snapshot.rooms)) {
      for (const item of snapshot.rooms) {
        addValues(item.materials || item);
      }
    } else {
      addValues(snapshot);
    }
  }

  // 2. Fallback: Se o snapshot estava vazio ou incompatível, calcula na hora com base na regra técnica padrão do gesso
  const totalExtracted = Object.values(totals).reduce((a, b) => a + b, 0);
  if (totalExtracted === 0 && Array.isArray(roomsData)) {
    for (const r of roomsData) {
      const area = (Number(r.lengthMeters) || 0) * (Number(r.widthMeters) || 0);
      const perimeter = 2 * ((Number(r.lengthMeters) || 0) + (Number(r.widthMeters) || 0));

      const services = Array.isArray(r.services) ? r.services : [];
      for (const s of services) {
        if (s.type === 'FORRO_PLAQUINHA_60X60' || !s.type) {
          // Rendimento técnico: 2.78 placas/m² + 5% quebra = ~2.92 un/m²; Gesso pó chumbamento: ~2.5 kg/m²
          totals.placaGesso60x60 += Math.ceil(area * 2.92);
          totals.gessoPoKg += Number((area * 2.5).toFixed(1));
          totals.arameGalvanizadoKg += Number((area * 0.08).toFixed(2));
          totals.sisalKg += Number((area * 0.05).toFixed(2));
        } else if (s.type === 'REVESTIMENTO_GESSO_LISO') {
          // Rendimento: ~5 kg de pó por m²
          totals.gessoPoKg += Number((area * 5.0).toFixed(1));
        } else if (s.type.includes('MOLDURA') || s.type.includes('SANCA') || s.type.includes('CORTINEIRO')) {
          const linearM = Number(s.customLinearMeters) || perimeter;
          totals.gessoColaKg += Number((linearM * 0.25).toFixed(1));
          totals.gessoPoKg += Number((linearM * 1.5).toFixed(1));
        }
      }
    }
  }

  return totals;
}

export async function updateQuoteStatusAction(id: string, status: QuoteStatus) {
  try {
    const quote = (await prisma.quote.findUnique({ where: { id } })) as any;
    if (!quote) return { success: false, error: 'Orçamento não encontrado.' };

    const shouldDeduct =
      (status === 'APROVADO' || status === 'EM_EXECUCAO' || status === 'CONCLUIDO') &&
      !quote.stockDeducted;
    const shouldRefund =
      (status === 'CANCELADO' || status === 'PENDENTE') && quote.stockDeducted;

    // Obtém materiais de forma garantida (lendo snapshot ou calculando na hora)
    const materials = calculateMaterialsFromRoomsOrSnapshot(quote.roomsData, quote.materialsSnapshot);

    console.log('[DEBUG ESTOQUE] Materiais calculados para movimentação:', materials);

    await prisma.$transaction(async (tx) => {
      // 1. Aplica a baixa no estoque
      if (shouldDeduct) {
        for (const [itemKey, qty] of Object.entries(materials)) {
          if (qty > 0) {
            await tx.stockBalance.update({
              where: { itemKey },
              data: { currentQuantity: { decrement: Number(qty.toFixed(2)) } },
            });
          }
        }
        await tx.quote.update({
          where: { id },
          data: { status, stockDeducted: true },
        });
      }
      // 2. Estorna materiais se a obra for cancelada ou voltar a ser pendente
      else if (shouldRefund) {
        for (const [itemKey, qty] of Object.entries(materials)) {
          if (qty > 0) {
            await tx.stockBalance.update({
              where: { itemKey },
              data: { currentQuantity: { increment: Number(qty.toFixed(2)) } },
            });
          }
        }
        await tx.quote.update({
          where: { id },
          data: { status, stockDeducted: false },
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