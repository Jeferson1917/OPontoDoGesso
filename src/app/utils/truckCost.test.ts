import { describe, expect, it } from 'vitest';
import { removeFromAverageCost, splitTruckCosts, weightedAverageCost } from './truckCost';

const base = { tonsGessoPo: 10, platesQuantity: 0, gessoCostTotal: 5500, platesCostTotal: 0, freightCost: 2200, unloadingLaborCost: 400 };

describe('splitTruckCosts', () => {
  it('só gesso: frete e descarga vão todos para o gesso', () => {
    const r = splitTruckCosts(base);
    expect(r.totalSpent).toBe(8100);
    expect(r.costPerKg).toBeCloseTo(0.81);
    expect(r.platesTotalCost).toBe(0);
  });

  it('gesso + placas: extras rateados pelo valor das notas', () => {
    const r = splitTruckCosts({ ...base, platesQuantity: 1000, gessoCostTotal: 6000, platesCostTotal: 2000, freightCost: 600, unloadingLaborCost: 200 });
    expect(r.gessoTotalCost).toBeCloseTo(6600); // 75% de 800
    expect(r.platesTotalCost).toBeCloseTo(2200); // 25% de 800
    expect(r.costPerKg).toBeCloseTo(0.66);
    expect(r.costPerPlate).toBeCloseTo(2.2);
  });

  it('placas sem nota: custo todo no gesso (comportamento antigo)', () => {
    const r = splitTruckCosts({ ...base, platesQuantity: 500, gessoCostTotal: 5000, freightCost: 1000, unloadingLaborCost: 0 });
    expect(r.gessoTotalCost).toBe(6000);
    expect(r.platesTotalCost).toBe(0);
  });

  it('só placas: a nota do gesso é ignorada', () => {
    const r = splitTruckCosts({ ...base, tonsGessoPo: 0, platesQuantity: 500, gessoCostTotal: 999, platesCostTotal: 1500, freightCost: 500, unloadingLaborCost: 0 });
    expect(r.gessoTotalCost).toBe(0);
    expect(r.costPerPlate).toBe(4);
  });

  it('valores negativos ou NaN viram zero', () => {
    const r = splitTruckCosts({ ...base, freightCost: -100, unloadingLaborCost: Number.NaN });
    expect(r.totalSpent).toBe(5500);
  });
});

describe('weightedAverageCost', () => {
  it('média ponderada', () => expect(weightedAverageCost(100, 2, 100, 300)).toBe(2.5));
  it('saldo negativo é tratado como zero', () => expect(weightedAverageCost(-10, 2, 100, 300)).toBe(3));
  it('sem quantidade mantém o custo', () => expect(weightedAverageCost(0, 2, 0, 0)).toBe(2));
});

describe('removeFromAverageCost', () => {
  it('desfaz exatamente uma entrada recém-lançada', () => {
    const avg = weightedAverageCost(1000, 0.7, 2000, 1600); // entra 2 t custando R$ 1.600
    expect(removeFromAverageCost(3000, avg, 2000, 1600)).toBeCloseTo(0.7);
  });
  it('sem sobrar saldo ou sem custo, mantém o custo', () => {
    expect(removeFromAverageCost(100, 2, 100, 50)).toBe(2);
    expect(removeFromAverageCost(100, 2, 50, 0)).toBe(2);
  });
  it('nunca fica negativo', () => expect(removeFromAverageCost(100, 1, 50, 500)).toBe(0));
});
