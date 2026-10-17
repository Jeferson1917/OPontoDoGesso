// src/app/utils/quoteDocument.ts
// Linhas e totais que o PDF mostra ao cliente. Usa as mesmas medidas do motor de orçamento,
// para a metragem impressa ser a mesma que foi cobrada.
import type { RoomInput, RoomServiceItem } from '../data/calculatorTypes';
import { DEFAULT_WALL_HEIGHT_METERS, MAX_WALL_HEIGHT_METERS } from './quoteEngine';

export interface QuoteDocumentRow {
  room: string;
  service: string;
  detail: string;
  measure: string;
}

export interface QuoteDocumentTotals {
  ceilingM2: number; // forro
  wallM2: number;    // revestimento de parede
  linearM: number;   // sancas, molduras e cortineiros
}

const fmt = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SERVICE_TITLES: Record<RoomServiceItem['type'], string> = {
  FORRO_PLAQUINHA_60X60: 'Forro Plaquinha Tradicional 60x60',
  REVESTIMENTO_GESSO_LISO: 'Aplicação de Gesso Liso em Alvenaria',
  SANCA_ABERTA_GESSO: 'Sanca Aberta com Aba e Espaço de Fita LED',
  SANCA_FECHADA_GESSO: 'Sanca Fechada Estruturada',
  MOLDURA_RODATOPO: 'Moldura de Roda-topo e Acabamento',
  CORTINEIRO_GESSO: 'Cortineiro Embutido',
};

function roomGeometry(room: RoomInput) {
  const length = Math.max(Number(room.lengthMeters) || 0, 0);
  const width = Math.max(Number(room.widthMeters) || 0, 0);
  const wallHeight = Math.min(room.wallHeightMeters || DEFAULT_WALL_HEIGHT_METERS, MAX_WALL_HEIGHT_METERS);
  return { length, width, area: length * width, perimeter: 2 * (length + width), wallHeight };
}

// Mesma regra do motor: metragem linear informada ou, na falta dela, o perímetro
const linearMeters = (srv: RoomServiceItem, perimeter: number) => srv.customLinearMeters ?? perimeter;

export function buildQuoteDocument(rooms: RoomInput[]): { rows: QuoteDocumentRow[]; totals: QuoteDocumentTotals } {
  const rows: QuoteDocumentRow[] = [];
  const totals: QuoteDocumentTotals = { ceilingM2: 0, wallM2: 0, linearM: 0 };

  for (const room of rooms) {
    const { length, width, area, perimeter, wallHeight } = roomGeometry(room);

    room.services.forEach((srv, index) => {
      let detail: string;
      let measure: string;

      switch (srv.type) {
        case 'FORRO_PLAQUINHA_60X60':
          detail = `Teto ${fmt(length)} m × ${fmt(width)} m`;
          measure = `${fmt(area)} m²`;
          totals.ceilingM2 += area;
          break;
        case 'REVESTIMENTO_GESSO_LISO': {
          const wallArea = perimeter * wallHeight;
          detail = `Paredes: ${fmt(perimeter)} m × ${fmt(wallHeight)} m de altura`;
          measure = `${fmt(wallArea)} m²`;
          totals.wallM2 += wallArea;
          break;
        }
        default: {
          const meters = linearMeters(srv, perimeter);
          detail = srv.customLinearMeters != null ? 'Metragem informada' : 'Perímetro do ambiente';
          measure = `${fmt(meters)} m lineares`;
          totals.linearM += meters;
        }
      }

      rows.push({ room: index === 0 ? room.name : '', service: SERVICE_TITLES[srv.type], detail, measure });
    });
  }

  return { rows, totals };
}

// Resumo do rodapé, só com as medidas que existem no orçamento
export function describeTotals(totals: QuoteDocumentTotals): string {
  const parts: string[] = [];
  if (totals.ceilingM2 > 0) parts.push(`Forro: ${fmt(totals.ceilingM2)} m²`);
  if (totals.wallM2 > 0) parts.push(`Paredes: ${fmt(totals.wallM2)} m²`);
  if (totals.linearM > 0) parts.push(`Lineares: ${fmt(totals.linearM)} m`);
  return parts.join('  •  ');
}
