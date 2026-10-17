import { describe, expect, it } from 'vitest';
import { businessDateParts, businessMonthStart, formatBusinessDate } from './dates';

describe('datas no fuso de Aracaju', () => {
  const lateNight = new Date('2026-09-30T22:30:00-03:00'); // 01:30 UTC de 01/10

  it('dia e mês locais, mesmo com o servidor em UTC', () => {
    expect(businessDateParts(lateNight)).toEqual({ year: 2026, month: 8, day: 30 });
    expect(formatBusinessDate(lateNight)).toBe('30/09/2026');
  });

  it('início do mês às 00h locais (03h UTC), inclusive virando o ano', () => {
    expect(businessMonthStart(2026, 9).toISOString()).toBe('2026-10-01T03:00:00.000Z');
    expect(businessMonthStart(2026, 12).toISOString()).toBe('2027-01-01T03:00:00.000Z');
    expect(businessMonthStart(2026, -1).toISOString()).toBe('2025-12-01T03:00:00.000Z');
  });
});
