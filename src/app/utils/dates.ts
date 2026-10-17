// src/app/utils/dates.ts
// O servidor de produção roda em UTC; datas do negócio são sempre exibidas e agrupadas no fuso de Aracaju.
export const BUSINESS_TIME_ZONE = 'America/Maceio';
// Sem horário de verão desde 2000: o deslocamento é fixo
const BUSINESS_UTC_OFFSET = '-03:00';

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

// Ano, mês (0–11) e dia de um instante, no fuso do negócio
export function businessDateParts(date: Date | string): { year: number; month: number; day: number } {
  const parts = Object.fromEntries(partsFormatter.formatToParts(new Date(date)).map((p) => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month) - 1, day: Number(parts.day) };
}

// Instante em que começa o dia 1 de um mês no fuso do negócio (mês 0–11; aceita valores fora da faixa)
export function businessMonthStart(year: number, month: number): Date {
  const normalized = new Date(Date.UTC(year, month, 1));
  const y = normalized.getUTCFullYear();
  const m = String(normalized.getUTCMonth() + 1).padStart(2, '0');
  return new Date(`${y}-${m}-01T00:00:00${BUSINESS_UTC_OFFSET}`);
}

export function formatBusinessDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: BUSINESS_TIME_ZONE, ...options });
}

// "AAAA-MM-DD" de hoje no fuso do negócio (valor padrão de campos de data)
export function businessTodayInput(now = new Date()): string {
  const { year, month, day } = businessDateParts(now);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Converte "AAAA-MM-DD" (campo de data) num instante ao meio-dia de Aracaju: o dia nunca escorrega para o anterior/seguinte
export function businessDateFromInput(value: string): Date {
  return new Date(`${value}T12:00:00${BUSINESS_UTC_OFFSET}`);
}
