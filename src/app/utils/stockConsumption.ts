// src/app/utils/stockConsumption.ts
import { RoomCalculationResult, RoomInput } from '../data/calculatorTypes';
import { StockItemKey } from '../data/stockTypes';
import { generateProjectQuote } from './quoteEngine';

export type StockQuantities = Partial<Record<StockItemKey, number>>;

const round2 = (value: number) => Number(value.toFixed(2));

function hasStockKeys(snapshot: unknown): snapshot is RoomCalculationResult[] {
  return (
    Array.isArray(snapshot) &&
    snapshot.some((room) => Array.isArray(room?.materials) && room.materials.some((m: { stockItemKey?: string }) => m?.stockItemKey))
  );
}

export function sumStockQuantities(rooms: RoomCalculationResult[]): StockQuantities {
  const totals: StockQuantities = {};
  for (const room of rooms) {
    for (const material of room.materials) {
      if (!material.stockItemKey || !material.stockQuantity) continue;
      totals[material.stockItemKey] = round2((totals[material.stockItemKey] ?? 0) + material.stockQuantity);
    }
  }
  return totals;
}

// Quantidades que um orçamento consome do pátio — as mesmas que aparecem no PDF.
// Orçamentos salvos antes do stockItemKey existir são recalculados a partir das metragens.
export function getQuoteStockQuantities(roomsData: unknown, snapshot: unknown): StockQuantities {
  if (hasStockKeys(snapshot)) return sumStockQuantities(snapshot);
  if (!Array.isArray(roomsData)) return {};
  return sumStockQuantities(generateProjectQuote(roomsData as RoomInput[]).rooms);
}

// Fórmula usada antes da issue #11. Serve APENAS para estornar orçamentos que já
// deram baixa com ela e não têm stockMovement gravado — assim volta exatamente o que saiu.
export function legacyStockQuantities(roomsData: unknown): StockQuantities {
  const totals = { gessoPoKg: 0, placaGesso60x60: 0, gessoColaKg: 0, arameGalvanizadoKg: 0, sisalKg: 0 };
  if (!Array.isArray(roomsData)) return totals;

  for (const r of roomsData) {
    const area = (Number(r.lengthMeters) || 0) * (Number(r.widthMeters) || 0);
    const perimeter = 2 * ((Number(r.lengthMeters) || 0) + (Number(r.widthMeters) || 0));

    const services = Array.isArray(r.services) ? r.services : [];
    for (const s of services) {
      if (s.type === 'FORRO_PLAQUINHA_60X60' || !s.type) {
        totals.placaGesso60x60 += Math.ceil(area * 2.92);
        totals.gessoPoKg += Number((area * 2.5).toFixed(1));
        totals.arameGalvanizadoKg += Number((area * 0.08).toFixed(2));
        totals.sisalKg += Number((area * 0.05).toFixed(2));
      } else if (s.type === 'REVESTIMENTO_GESSO_LISO') {
        totals.gessoPoKg += Number((area * 5.0).toFixed(1));
      } else if (s.type.includes('MOLDURA') || s.type.includes('SANCA') || s.type.includes('CORTINEIRO')) {
        const linearM = Number(s.customLinearMeters) || perimeter;
        totals.gessoColaKg += Number((linearM * 0.25).toFixed(1));
        totals.gessoPoKg += Number((linearM * 1.5).toFixed(1));
      }
    }
  }

  return totals;
}
