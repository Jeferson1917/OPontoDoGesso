// src/app/utils/payments.ts
import { businessDateParts } from './dates';

export const PAYMENT_METHODS = ['PIX', 'DINHEIRO', 'CARTAO', 'TRANSFERENCIA', 'OUTRO'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO: 'Cartão',
  TRANSFERENCIA: 'Transferência',
  OUTRO: 'Outro',
};

const cents = (value: number) => Math.round(value * 100) / 100;

export interface PaymentSummary {
  paid: number;
  remaining: number;
  status: 'NADA' | 'PARCIAL' | 'QUITADO';
}

export function summarizePayments(total: number, payments: { amount: number }[]): PaymentSummary {
  const paid = cents(payments.reduce((acc, p) => acc + p.amount, 0));
  const remaining = cents(Math.max(total - paid, 0));
  return { paid, remaining, status: paid <= 0 ? 'NADA' : remaining <= 0 ? 'QUITADO' : 'PARCIAL' };
}

// Quanto falta receber das obras fechadas (aprovadas, em execução ou concluídas)
export function totalReceivable(quotes: { status: string; price: number; payments: { amount: number }[] }[]): number {
  const closed = ['APROVADO', 'EM_EXECUCAO', 'CONCLUIDO'];
  return cents(quotes.filter((q) => closed.includes(q.status)).reduce((acc, q) => acc + summarizePayments(q.price, q.payments).remaining, 0));
}

// Total recebido no mês corrente (fuso de Aracaju)
export function receivedThisMonth(payments: { amount: number; paidAt: Date }[], now = new Date()): number {
  const current = businessDateParts(now);
  return cents(
    payments
      .filter((p) => {
        const d = businessDateParts(p.paidAt);
        return d.year === current.year && d.month === current.month;
      })
      .reduce((acc, p) => acc + p.amount, 0)
  );
}
