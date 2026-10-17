// src/app/data/quoteStatus.ts
export type QuoteStatusValue = 'PENDENTE' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';

export const QUOTE_STATUS_LABELS: Record<QuoteStatusValue, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  EM_EXECUCAO: 'Em Obra',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

// Para onde cada status pode ir. Regras:
// - Obra concluída é final: só pode ser reaberta (volta para "Em Obra", sem mexer no estoque).
//   Cancelar ou voltar a pendente devolveria ao estoque material que já está instalado.
// - Obra em execução não volta para pendente (o que fazer com o material está na issue #51).
export const ALLOWED_STATUS_TRANSITIONS: Record<QuoteStatusValue, QuoteStatusValue[]> = {
  PENDENTE: ['APROVADO', 'EM_EXECUCAO', 'CANCELADO'],
  APROVADO: ['PENDENTE', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO'],
  EM_EXECUCAO: ['APROVADO', 'CONCLUIDO', 'CANCELADO'],
  CONCLUIDO: ['EM_EXECUCAO'],
  CANCELADO: ['PENDENTE', 'APROVADO'],
};

export const canChangeStatus = (from: QuoteStatusValue, to: QuoteStatusValue) =>
  ALLOWED_STATUS_TRANSITIONS[from].includes(to);
