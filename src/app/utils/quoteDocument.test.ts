import { describe, expect, it } from 'vitest';
import { buildQuoteDocument, describeTotals } from './quoteDocument';
import type { RoomInput } from '../data/calculatorTypes';

const room = (overrides: Partial<RoomInput>): RoomInput => ({
  id: '1',
  name: 'Sala',
  lengthMeters: 5,
  widthMeters: 4,
  services: [],
  ...overrides,
});

describe('buildQuoteDocument', () => {
  it('revestimento mostra a área de parede cobrada, não a do piso', () => {
    const { rows, totals } = buildQuoteDocument([room({ services: [{ type: 'REVESTIMENTO_GESSO_LISO' }] })]);
    expect(rows[0].measure).toBe('50,40 m²'); // 18 m × 2,80 m
    expect(rows[0].detail).toBe('Paredes: 18,00 m × 2,80 m de altura');
    expect(totals.wallM2).toBeCloseTo(50.4);
    expect(totals.ceilingM2).toBe(0);
  });

  it('revestimento usa a altura informada', () => {
    const { rows } = buildQuoteDocument([room({ wallHeightMeters: 3.5, services: [{ type: 'REVESTIMENTO_GESSO_LISO' }] })]);
    expect(rows[0].measure).toBe('63,00 m²');
  });

  it('forro mostra a área do teto', () => {
    const { rows, totals } = buildQuoteDocument([room({ services: [{ type: 'FORRO_PLAQUINHA_60X60' }] })]);
    expect(rows[0].measure).toBe('20,00 m²');
    expect(totals.ceilingM2).toBe(20);
  });

  it('sanca, moldura e cortineiro em metros lineares (informado ou perímetro)', () => {
    const { rows, totals } = buildQuoteDocument([
      room({ services: [{ type: 'SANCA_ABERTA_GESSO' }, { type: 'MOLDURA_RODATOPO', customLinearMeters: 10 }] }),
    ]);
    expect(rows.map((r) => r.measure)).toEqual(['18,00 m lineares', '10,00 m lineares']);
    expect(rows.map((r) => r.room)).toEqual(['Sala', '']); // nome do cômodo só na primeira linha
    expect(totals.linearM).toBe(28);
  });

  it('rodapé resume só as medidas que existem', () => {
    const { totals } = buildQuoteDocument([
      room({ services: [{ type: 'FORRO_PLAQUINHA_60X60' }, { type: 'REVESTIMENTO_GESSO_LISO' }] }),
      room({ id: '2', name: 'Quarto', lengthMeters: 3, widthMeters: 3, services: [{ type: 'CORTINEIRO_GESSO', customLinearMeters: 3 }] }),
    ]);
    expect(describeTotals(totals)).toBe('Forro: 20,00 m²  •  Paredes: 50,40 m²  •  Lineares: 3,00 m');
    expect(describeTotals({ ceilingM2: 9, wallM2: 0, linearM: 0 })).toBe('Forro: 9,00 m²');
  });
});
