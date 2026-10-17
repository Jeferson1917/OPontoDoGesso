import { describe, expect, it } from 'vitest';
import { defaultPricingConfig, sanitizePricingConfig } from './pricingConfig';

describe('sanitizePricingConfig', () => {
  it('vazio vira os padrões', () => {
    expect(sanitizePricingConfig({})).toEqual(defaultPricingConfig);
    expect(sanitizePricingConfig(null)).toEqual(defaultPricingConfig);
  });

  it('mantém valores válidos e descarta inválidos', () => {
    const r = sanitizePricingConfig({
      laborRates: { FORRO_PLAQUINHA_60X60: 41.5, SANCA_ABERTA_GESSO: -10, INVENTADO: 99 },
      materialCosts: { placaGesso60x60: 'caro' },
      profitMarginMultiplier: 0.5,
      wasteFactor: 1.2,
      minimumProjectPrice: Number.NaN,
    });
    expect(r.laborRates.FORRO_PLAQUINHA_60X60).toBe(41.5);
    expect(r.laborRates.SANCA_ABERTA_GESSO).toBe(defaultPricingConfig.laborRates.SANCA_ABERTA_GESSO);
    expect(r.laborRates).not.toHaveProperty('INVENTADO');
    expect(r.materialCosts.placaGesso60x60).toBe(defaultPricingConfig.materialCosts.placaGesso60x60);
    expect(r.profitMarginMultiplier).toBe(defaultPricingConfig.profitMarginMultiplier); // margem < 1 é inválida
    expect(r.wasteFactor).toBe(1.2);
    expect(r.minimumProjectPrice).toBe(defaultPricingConfig.minimumProjectPrice);
  });
});
