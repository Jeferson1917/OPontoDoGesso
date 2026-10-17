import { describe, expect, it } from 'vitest';
import { ALLOWED_STATUS_TRANSITIONS, canChangeStatus } from './quoteStatus';

describe('transições de status', () => {
  it('obra concluída só pode ser reaberta', () => {
    expect(ALLOWED_STATUS_TRANSITIONS.CONCLUIDO).toEqual(['EM_EXECUCAO']);
    expect(canChangeStatus('CONCLUIDO', 'CANCELADO')).toBe(false);
    expect(canChangeStatus('CONCLUIDO', 'PENDENTE')).toBe(false);
  });

  it('obra em execução não volta para pendente', () => {
    expect(canChangeStatus('EM_EXECUCAO', 'PENDENTE')).toBe(false);
    expect(canChangeStatus('EM_EXECUCAO', 'CONCLUIDO')).toBe(true);
  });

  it('fluxo normal continua permitido', () => {
    expect(canChangeStatus('PENDENTE', 'APROVADO')).toBe(true);
    expect(canChangeStatus('APROVADO', 'EM_EXECUCAO')).toBe(true);
    expect(canChangeStatus('CANCELADO', 'PENDENTE')).toBe(true);
  });

  it('nenhum status lista a si mesmo', () => {
    for (const [from, to] of Object.entries(ALLOWED_STATUS_TRANSITIONS)) expect(to).not.toContain(from);
  });
});
