'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { getAdminSession, unauthorized } from '../../lib/auth';
import { idSchema, parseInput, paymentSchema } from '../data/schemas';
import { businessDateFromInput } from '../utils/dates';
import { summarizePayments } from '../utils/payments';
import { getEffectivePrice } from '../utils/dashboardMetrics';

class PaymentError extends Error {}

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export async function addPaymentAction(input: z.input<typeof paymentSchema>) {
  if (!(await getAdminSession())) return unauthorized();
  const parsed = parseInput(paymentSchema, input);
  if (!parsed.ok) return { success: false as const, error: parsed.error };
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Trava o orçamento: dois lançamentos simultâneos não passam juntos do valor total
      await tx.$queryRaw`SELECT id FROM quotes WHERE id = ${data.quoteId} FOR UPDATE`;
      const quote = await tx.quote.findUnique({ where: { id: data.quoteId }, include: { payments: true } });
      if (!quote) throw new PaymentError('Orçamento não encontrado.');
      if (quote.status === 'CANCELADO') throw new PaymentError('Não é possível lançar pagamento em obra cancelada.');

      const { remaining } = summarizePayments(getEffectivePrice(quote), quote.payments);
      if (data.amount > remaining + 0.005) {
        throw new PaymentError(`O valor (${brl(data.amount)}) é maior que o que falta receber (${brl(remaining)}).`);
      }

      await tx.payment.create({
        data: {
          quoteId: data.quoteId,
          amount: data.amount,
          method: data.method,
          paidAt: businessDateFromInput(data.paidAt),
          notes: data.notes ?? null,
        },
      });
    }, { maxWait: 10_000, timeout: 20_000 });

    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    return { success: true as const };
  } catch (error) {
    if (error instanceof PaymentError) return { success: false as const, error: error.message };
    console.error('Erro ao lançar pagamento:', error);
    return { success: false as const, error: 'Falha ao lançar o pagamento.' };
  }
}

export async function deletePaymentAction(paymentId: string) {
  if (!(await getAdminSession())) return unauthorized();
  const parsedId = parseInput(idSchema, paymentId);
  if (!parsedId.ok) return { success: false as const, error: 'Pagamento inválido.' };

  try {
    const { count } = await prisma.payment.deleteMany({ where: { id: parsedId.data } });
    if (count === 0) return { success: false as const, error: 'Pagamento não encontrado.' };
    revalidatePath('/admin');
    revalidatePath('/admin/historico');
    return { success: true as const };
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    return { success: false as const, error: 'Falha ao excluir o pagamento.' };
  }
}
