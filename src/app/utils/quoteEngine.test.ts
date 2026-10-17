import { describe, expect, it } from 'vitest';
import { calculateRoomQuote, generateProjectQuote } from './quoteEngine';
import type { RoomInput } from '../data/calculatorTypes';
import { defaultPricingConfig } from '../data/pricingConfig';

const room = (overrides: Partial<RoomInput> = {}): RoomInput => ({
  id: '1',
  name: 'Sala',
  lengthMeters: 5,
  widthMeters: 4,
  services: [{ type: 'FORRO_PLAQUINHA_60X60' }],
  ...overrides,
});

const byStockKey = (r: ReturnType<typeof calculateRoomQuote>) =>
  Object.fromEntries(r.materials.filter((m) => m.stockItemKey).map((m) => [m.stockItemKey, m.stockQuantity]));

describe('calculateRoomQuote', () => {
  it('forro 60x60 em 5×4: placas com quebra, insumos e mão de obra', () => {
    const r = calculateRoomQuote(room());
    expect(r.areaM2).toBe(20);
    expect(r.perimeterMeters).toBe(18);
    expect(r.laborCost).toBe(700); // 20 m² × R$ 35
    // 62 placas (20/0,36 × 1,10), 3 sacos (1 a cada 7 m²), 3 kg arame, 2 kg sisal, 6 kg cola
    expect(byStockKey(r)).toEqual({ placaGesso60x60: 62, gessoPoKg: 60, arameGalvanizadoKg: 3, sisalKg: 2, gessoColaKg: 6 });
    expect(r.materialCost).toBe(480); // 279 + 78 + 66 + 36 + 21
    expect(r.totalRoomPrice).toBe(1180);
  });

  it('revestimento usa a área de parede (perímetro × altura)', () => {
    const r = calculateRoomQuote(room({ services: [{ type: 'REVESTIMENTO_GESSO_LISO' }] }));
    expect(r.laborCost).toBe(1411.2); // 18 × 2,8 = 50,4 m² × R$ 28
    expect(byStockKey(r)).toEqual({ gessoPoKg: 420 }); // 21 sacos (50,4 / 2,5) × 20 kg

    const alta = calculateRoomQuote(room({ wallHeightMeters: 3.5, services: [{ type: 'REVESTIMENTO_GESSO_LISO' }] }));
    expect(alta.laborCost).toBe(1764); // 63 m² × R$ 28
    expect(byStockKey(alta)).toEqual({ gessoPoKg: 520 }); // 26 sacos
  });

  it('altura de parede acima de 10 m é limitada', () => {
    const r = calculateRoomQuote(room({ wallHeightMeters: 50, services: [{ type: 'REVESTIMENTO_GESSO_LISO' }] }));
    expect(r.laborCost).toBe(18 * 10 * 28);
  });

  it('sanca usa o perímetro quando não há metragem linear', () => {
    const r = calculateRoomQuote(room({ services: [{ type: 'SANCA_ABERTA_GESSO' }] }));
    expect(r.laborCost).toBe(810); // 18 m × R$ 45
    expect(byStockKey(r)).toEqual({ gessoPoKg: 100 }); // 5 sacos (18/4)
  });

  it('moldura usa a metragem linear informada e não baixa a peça fabricada do estoque', () => {
    const r = calculateRoomQuote(room({ services: [{ type: 'MOLDURA_RODATOPO', customLinearMeters: 10 }] }));
    expect(r.laborCost).toBe(200); // 10 m × R$ 20
    expect(r.materialCost).toBe(87); // 10 m × R$ 8 + 2 kg cola × R$ 3,50
    expect(byStockKey(r)).toEqual({ gessoColaKg: 2 });
    expect(r.materials.find((m) => m.unit === 'm')?.stockItemKey).toBeUndefined();
  });

  it('medidas absurdas ou inválidas são limitadas', () => {
    expect(calculateRoomQuote(room({ lengthMeters: 1000 })).areaM2).toBe(400); // 100 × 4
    expect(calculateRoomQuote(room({ lengthMeters: Number.NaN })).areaM2).toBe(0);
    expect(calculateRoomQuote(room({ lengthMeters: -5 })).areaM2).toBe(0);
  });

  it('fator de quebra maior aumenta as placas', () => {
    const r = calculateRoomQuote(room(), { ...defaultPricingConfig, wasteFactor: 1.2 });
    expect(byStockKey(r).placaGesso60x60).toBe(67); // 20/0,36 × 1,2 = 66,67
  });
});

describe('generateProjectQuote', () => {
  it('aplica a margem sobre o custo direto', () => {
    const q = generateProjectQuote([room()]);
    expect(q.totalMaterialCost).toBe(480);
    expect(q.totalLaborCost).toBe(700);
    expect(q.suggestedFinalPrice).toBe(1593); // 1180 × 1,35
  });

  it('respeita o preço mínimo da obra', () => {
    const q = generateProjectQuote([room({ lengthMeters: 0.5, widthMeters: 0.5 })]);
    expect(q.suggestedFinalPrice).toBe(defaultPricingConfig.minimumProjectPrice);
  });

  it('soma vários cômodos', () => {
    const q = generateProjectQuote([room(), room({ id: '2', lengthMeters: 3, widthMeters: 3 })]);
    expect(q.rooms).toHaveLength(2);
    expect(q.totalAreaM2).toBe(29);
  });
});
