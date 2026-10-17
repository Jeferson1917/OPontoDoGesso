import { describe, expect, it } from 'vitest';
import { buildMonthlyFinancials, dashboardStartDate, type QuoteMetricsRow } from './dashboardMetrics';

const now = new Date('2026-10-15T12:00:00-03:00');
const snapshot = [{ laborCost: 700, materialCost: 480, materials: [] }];
const quote = (o: Partial<QuoteMetricsRow>): QuoteMetricsRow => ({
  status: 'APROVADO',
  createdAt: new Date('2026-07-01T10:00:00-03:00'),
  approvedAt: new Date('2026-09-10T10:00:00-03:00'),
  totalAreaM2: 20,
  suggestedFinalPrice: 1593,
  finalAgreedPrice: 1500,
  roomsData: [],
  materialsSnapshot: snapshot,
  stockMovement: { gessoPoKg: 60 },
  ...o,
});
const month = (rows: ReturnType<typeof buildMonthlyFinancials>, key: string) => rows.find((r) => r.month === key)!;

describe('buildMonthlyFinancials', () => {
  it('gera os últimos 6 meses', () => {
    expect(buildMonthlyFinancials([], [], [], now).map((r) => r.month)).toEqual(['Mai/26', 'Jun/26', 'Jul/26', 'Ago/26', 'Set/26', 'Out/26']);
    expect(dashboardStartDate(now)).toEqual(new Date('2026-05-01T00:00:00-03:00'));
  });

  it('obra entra no mês da aprovação, com custo e gesso reais', () => {
    const rows = buildMonthlyFinancials([quote({})], [], [], now);
    const set = month(rows, 'Set/26');
    expect(set.faturamentoObras).toBe(1500);
    expect(set.custo).toBe(1180);
    expect(set.lucroObras).toBe(320);
    expect(set.gessoObrasTon).toBeCloseTo(0.06);
    expect(month(rows, 'Jul/26').faturamento).toBe(0); // não entra no mês de criação
  });

  it('sem data de aprovação usa a criação; pendentes e cancelados ficam de fora', () => {
    const rows = buildMonthlyFinancials(
      [quote({ approvedAt: null }), quote({ status: 'PENDENTE' }), quote({ status: 'CANCELADO' })],
      [],
      [],
      now
    );
    expect(month(rows, 'Jul/26').faturamentoObras).toBe(1500);
    expect(month(rows, 'Set/26').faturamentoObras).toBe(0);
  });

  it('usa o preço sugerido quando não houve valor negociado', () => {
    const rows = buildMonthlyFinancials([quote({ finalAgreedPrice: 0 })], [], [], now);
    expect(month(rows, 'Set/26').faturamento).toBe(1593);
  });

  it('balcão e caminhões', () => {
    const rows = buildMonthlyFinancials(
      [],
      [{ createdAt: new Date('2026-10-02T10:00:00-03:00'), itemKey: 'gessoPoKg', quantity: 100, totalValue: 110, estimatedProfit: 34 }],
      [{ date: new Date('2026-08-20T10:00:00-03:00'), tonsGessoPo: 10 }],
      now
    );
    const out = month(rows, 'Out/26');
    expect(out.faturamentoBalcao).toBe(110);
    expect(out.lucroBalcao).toBe(34);
    expect(out.custo).toBe(76);
    expect(out.gessoBalcaoTon).toBeCloseTo(0.1);
    expect(month(rows, 'Ago/26').gessoEntradaTon).toBe(10);
  });
});

describe('fuso horário (produção roda em UTC)', () => {
  it('venda às 22h30 do último dia do mês fica no mês certo', () => {
    const rows = buildMonthlyFinancials(
      [],
      [{ createdAt: new Date('2026-09-30T22:30:00-03:00'), itemKey: 'sisalKg', quantity: 1, totalValue: 100, estimatedProfit: 30 }],
      [],
      now
    );
    expect(month(rows, 'Set/26').faturamentoBalcao).toBe(100);
    expect(month(rows, 'Out/26').faturamentoBalcao).toBe(0);
  });
});
