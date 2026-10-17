import { describe, expect, it } from 'vitest';
import { receivedThisMonth, summarizePayments, totalReceivable } from './payments';
import { businessDateFromInput, businessTodayInput } from './dates';

describe('summarizePayments', () => {
  it('nada pago, parcial e quitado', () => {
    expect(summarizePayments(1000, [])).toEqual({ paid: 0, remaining: 1000, status: 'NADA' });
    expect(summarizePayments(1000, [{ amount: 500 }])).toEqual({ paid: 500, remaining: 500, status: 'PARCIAL' });
    expect(summarizePayments(1000, [{ amount: 500 }, { amount: 500 }])).toEqual({ paid: 1000, remaining: 0, status: 'QUITADO' });
  });
  it('arredonda centavos (sem 0,30000000004)', () => {
    expect(summarizePayments(0.3, [{ amount: 0.1 }, { amount: 0.2 }]).status).toBe('QUITADO');
  });
});

describe('totalReceivable', () => {
  it('soma o que falta só das obras fechadas', () => {
    expect(totalReceivable([
      { status: 'APROVADO', price: 1000, payments: [{ amount: 500 }] },
      { status: 'CONCLUIDO', price: 800, payments: [] },
      { status: 'PENDENTE', price: 999, payments: [] },
      { status: 'CANCELADO', price: 999, payments: [] },
    ])).toBe(1300);
  });
});

describe('receivedThisMonth', () => {
  it('conta pelo mês de Aracaju, mesmo perto da virada', () => {
    const now = new Date('2026-10-15T12:00:00-03:00');
    expect(receivedThisMonth([
      { amount: 100, paidAt: new Date('2026-10-01T00:30:00-03:00') }, // outubro
      { amount: 50, paidAt: new Date('2026-09-30T23:30:00-03:00') },  // setembro (02:30 UTC de 01/10)
    ], now)).toBe(100);
  });
});

describe('datas de formulário', () => {
  it('converte o dia digitado sem escorregar de dia', () => {
    expect(businessDateFromInput('2026-10-01').toISOString()).toBe('2026-10-01T15:00:00.000Z');
    expect(businessTodayInput(new Date('2026-09-30T23:30:00-03:00'))).toBe('2026-09-30');
  });
});
