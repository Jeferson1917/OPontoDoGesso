// src/app/utils/dashboardMetrics.ts
import type { MonthlyData } from '../admin/DashboardCharts';
import { getQuoteStockQuantities, type StockQuantities } from './stockConsumption';

export const APPROVED_STATUSES = ['APROVADO', 'EM_EXECUCAO', 'CONCLUIDO'] as const;
export const DASHBOARD_MONTHS = 6;

export interface QuoteMetricsRow {
  status: string;
  createdAt: Date;
  approvedAt: Date | null;
  totalAreaM2: number;
  suggestedFinalPrice: number;
  finalAgreedPrice: number;
  roomsData: unknown;
  materialsSnapshot: unknown;
  stockMovement: unknown;
}

export interface SaleMetricsRow {
  createdAt: Date;
  itemKey: string;
  quantity: number;
  totalValue: number;
  estimatedProfit: number;
}

export interface TruckMetricsRow {
  date: Date;
  tonsGessoPo: number;
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const monthKey = (d: Date) => `${MONTH_NAMES[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;

export const getEffectivePrice = (q: Pick<QuoteMetricsRow, 'finalAgreedPrice' | 'suggestedFinalPrice'>) =>
  q.finalAgreedPrice && q.finalAgreedPrice > 0 ? q.finalAgreedPrice : q.suggestedFinalPrice;

export const isApproved = (status: string) => (APPROVED_STATUSES as readonly string[]).includes(status);

// Primeiro dia do mês mais antigo exibido nos gráficos
export function dashboardStartDate(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() - (DASHBOARD_MONTHS - 1), 1);
}

// Custo direto da obra (mão de obra + materiais) gravado no orçamento
export function quoteDirectCost(snapshot: unknown): number {
  if (!Array.isArray(snapshot)) return 0;
  return snapshot.reduce(
    (acc, room) => acc + (Number(room?.laborCost) || 0) + (Number(room?.materialCost) || 0),
    0
  );
}

// Gesso que a obra consome: o que de fato saiu do estoque, ou o calculado se ainda não baixou
export function quoteGessoKg(q: Pick<QuoteMetricsRow, 'roomsData' | 'materialsSnapshot' | 'stockMovement'>): number {
  const movement = q.stockMovement as StockQuantities | null;
  if (movement && typeof movement === 'object') return movement.gessoPoKg ?? 0;
  return getQuoteStockQuantities(q.roomsData, q.materialsSnapshot).gessoPoKg ?? 0;
}

export function buildMonthlyFinancials(
  quotes: QuoteMetricsRow[],
  sales: SaleMetricsRow[],
  trucks: TruckMetricsRow[],
  now = new Date()
): MonthlyData[] {
  const months = new Map<string, MonthlyData>();
  for (let i = DASHBOARD_MONTHS - 1; i >= 0; i--) {
    const key = monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1));
    months.set(key, {
      month: key,
      faturamento: 0, lucro: 0, custo: 0,
      gessoEntradaTon: 0, gessoSaidaTon: 0,
      faturamentoBalcao: 0, lucroBalcao: 0,
      faturamentoObras: 0, lucroObras: 0,
      gessoObrasTon: 0, gessoBalcaoTon: 0,
    });
  }

  for (const q of quotes) {
    if (!isApproved(q.status)) continue;
    // Receita entra no mês da aprovação (orçamentos antigos, sem a data, usam a criação)
    const current = months.get(monthKey(q.approvedAt ?? q.createdAt));
    if (!current) continue;
    const price = getEffectivePrice(q);
    const cost = quoteDirectCost(q.materialsSnapshot);
    const tons = quoteGessoKg(q) / 1000;

    current.faturamento += price;
    current.custo += cost;
    current.lucro += price - cost;
    current.faturamentoObras += price;
    current.lucroObras += price - cost;
    current.gessoObrasTon += tons;
    current.gessoSaidaTon += tons;
  }

  for (const s of sales) {
    const current = months.get(monthKey(s.createdAt));
    if (!current) continue;
    const tons = s.itemKey === 'gessoPoKg' ? s.quantity / 1000 : 0;

    current.faturamento += s.totalValue;
    current.lucro += s.estimatedProfit;
    current.custo += s.totalValue - s.estimatedProfit;
    current.faturamentoBalcao += s.totalValue;
    current.lucroBalcao += s.estimatedProfit;
    current.gessoBalcaoTon += tons;
    current.gessoSaidaTon += tons;
  }

  for (const t of trucks) {
    const current = months.get(monthKey(t.date));
    if (current) current.gessoEntradaTon += Number(t.tonsGessoPo) || 0;
  }

  return Array.from(months.values());
}
