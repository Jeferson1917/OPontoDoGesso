import { describe, expect, it } from 'vitest';
import { getQuoteStockQuantities, legacyStockQuantities } from './stockConsumption';
import { generateProjectQuote } from './quoteEngine';
import type { RoomInput } from '../data/calculatorTypes';

const rooms: RoomInput[] = [{ id: '1', name: 'Sala', lengthMeters: 5, widthMeters: 4, services: [{ type: 'FORRO_PLAQUINHA_60X60' }] }];
const pdfQuantities = { placaGesso60x60: 62, gessoPoKg: 60, arameGalvanizadoKg: 3, sisalKg: 2, gessoColaKg: 6 };

describe('getQuoteStockQuantities', () => {
  it('baixa exatamente o que o orçamento (PDF) mostra', () => {
    expect(getQuoteStockQuantities(rooms, generateProjectQuote(rooms).rooms)).toEqual(pdfQuantities);
  });

  it('orçamento antigo (snapshot sem stockItemKey) é recalculado pelas metragens', () => {
    const legacySnapshot = generateProjectQuote(rooms).rooms.map((r) => ({
      ...r,
      materials: r.materials.map((m) => ({ name: m.name, unit: m.unit, quantity: m.quantity, unitCost: m.unitCost, totalCost: m.totalCost })),
    }));
    expect(getQuoteStockQuantities(rooms, legacySnapshot)).toEqual(pdfQuantities);
  });

  it('soma o mesmo item de vários serviços', () => {
    const two: RoomInput[] = [{ ...rooms[0], services: [{ type: 'FORRO_PLAQUINHA_60X60' }, { type: 'SANCA_FECHADA_GESSO' }] }];
    expect(getQuoteStockQuantities(two, generateProjectQuote(two).rooms).gessoPoKg).toBe(160); // 60 + 5 sacos da sanca
  });

  it('dados inválidos não quebram', () => {
    expect(getQuoteStockQuantities(null, null)).toEqual({});
  });
});

describe('legacyStockQuantities', () => {
  it('reproduz a fórmula antiga (usada só para estornar baixas antigas)', () => {
    expect(legacyStockQuantities(rooms)).toEqual({ gessoPoKg: 50, placaGesso60x60: 59, gessoColaKg: 0, arameGalvanizadoKg: 1.6, sisalKg: 1 });
  });
});
