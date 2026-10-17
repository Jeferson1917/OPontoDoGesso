// src/lib/loginRateLimit.ts
import 'server-only';

// Limite em memória: vale por instância do servidor. Em serverless cada instância
// tem seu próprio contador, então é uma barreira contra força bruta simples, não absoluta.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

interface Attempt {
  failures: number;
  firstFailureAt: number;
}

const attempts = new Map<string, Attempt>();

function getActiveAttempt(ip: string, now: number): Attempt | null {
  const attempt = attempts.get(ip);
  if (!attempt) return null;
  if (now - attempt.firstFailureAt > WINDOW_MS) {
    attempts.delete(ip);
    return null;
  }
  return attempt;
}

// Retorna quantos minutos faltam para liberar, ou 0 se pode tentar
export function getLoginBlockMinutes(ip: string, now = Date.now()): number {
  const attempt = getActiveAttempt(ip, now);
  if (!attempt || attempt.failures < MAX_FAILURES) return 0;
  return Math.ceil((attempt.firstFailureAt + WINDOW_MS - now) / 60000);
}

export function registerLoginFailure(ip: string, now = Date.now()): void {
  const attempt = getActiveAttempt(ip, now);
  if (attempt) {
    attempt.failures += 1;
  } else {
    attempts.set(ip, { failures: 1, firstFailureAt: now });
  }
}

export function clearLoginFailures(ip: string): void {
  attempts.delete(ip);
}
