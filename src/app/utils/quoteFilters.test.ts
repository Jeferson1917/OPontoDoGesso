import { describe, expect, it } from 'vitest';
import { matchesQuoteFilter, type QuoteFilter } from './quoteFilters';

const quote = { clientName: 'João da Silva', clientPhone: '(79) 99811-3110', status: 'APROVADO', price: 1000, payments: [{ amount: 400 }] };
const all: QuoteFilter = { text: '', status: 'TODOS', payment: 'TODOS' };

describe('matchesQuoteFilter', () => {
  it('busca por nome sem acento e sem diferenciar maiúsculas', () => {
    expect(matchesQuoteFilter(quote, { ...all, text: 'joao' })).toBe(true);
    expect(matchesQuoteFilter(quote, { ...all, text: 'SILVA' })).toBe(true);
    expect(matchesQuoteFilter(quote, { ...all, text: 'maria' })).toBe(false);
  });
  it('busca por telefone, com ou sem formatação', () => {
    expect(matchesQuoteFilter(quote, { ...all, text: '99811' })).toBe(true);
    expect(matchesQuoteFilter(quote, { ...all, text: '9981-13' })).toBe(true);
  });
  it('filtra por status', () => {
    expect(matchesQuoteFilter(quote, { ...all, status: 'APROVADO' })).toBe(true);
    expect(matchesQuoteFilter(quote, { ...all, status: 'PENDENTE' })).toBe(false);
  });
  it('filtra por pagamento', () => {
    expect(matchesQuoteFilter(quote, { ...all, payment: 'A_RECEBER' })).toBe(true);
    expect(matchesQuoteFilter(quote, { ...all, payment: 'QUITADO' })).toBe(false);
    expect(matchesQuoteFilter({ ...quote, status: 'PENDENTE' }, { ...all, payment: 'A_RECEBER' })).toBe(false); // ainda não fechou
    expect(matchesQuoteFilter({ ...quote, payments: [{ amount: 1000 }] }, { ...all, payment: 'QUITADO' })).toBe(true);
  });
});
