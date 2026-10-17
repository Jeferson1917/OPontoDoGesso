// src/app/utils/quoteFilters.ts
import { summarizePayments } from './payments';

export type PaymentFilter = 'TODOS' | 'A_RECEBER' | 'QUITADO';

export interface QuoteFilter {
  text: string;
  status: string; // 'TODOS' ou um status
  payment: PaymentFilter;
}

interface FilterableQuote {
  clientName: string;
  clientPhone: string | null;
  status: string;
  price: number;
  payments: { amount: number }[];
}

// Ignora acentos e maiúsculas ("joão" encontra "Joao")
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function matchesQuoteFilter(quote: FilterableQuote, filter: QuoteFilter): boolean {
  const text = normalize(filter.text.trim());
  if (text) {
    const digits = text.replace(/\D/g, '');
    const byName = normalize(quote.clientName).includes(text);
    const byPhone = digits.length >= 3 && (quote.clientPhone ?? '').replace(/\D/g, '').includes(digits);
    if (!byName && !byPhone) return false;
  }
  if (filter.status !== 'TODOS' && quote.status !== filter.status) return false;
  if (filter.payment !== 'TODOS') {
    const { status } = summarizePayments(quote.price, quote.payments);
    if (filter.payment === 'QUITADO' && status !== 'QUITADO') return false;
    if (filter.payment === 'A_RECEBER' && (status === 'QUITADO' || quote.status === 'CANCELADO' || quote.status === 'PENDENTE')) return false;
  }
  return true;
}
