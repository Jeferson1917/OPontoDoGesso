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

export async function updateQuoteStatusAction(id: string, status: QuoteStatus) {
  try {
    const updated = await prisma.quote.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    return { success: true, quote: updated };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return { success: false, error: 'Não foi possível atualizar o status.' };
  }
}