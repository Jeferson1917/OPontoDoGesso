// src/app/utils/truckCost.ts

export interface TruckCostInput {
  tonsGessoPo: number;
  platesQuantity: number;
  gessoCostTotal: number;  // Nota do gesso em pó
  platesCostTotal: number; // Nota das placas
  freightCost: number;
  unloadingLaborCost: number;
}

export interface TruckCostSplit {
  totalSpent: number;
  gessoTotalCost: number;  // Nota do gesso + parte do frete/descarga
  platesTotalCost: number; // Nota das placas + parte do frete/descarga
  costPerKg: number;
  costPerPlate: number;
}

const safe = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

// Frete e descarga são rateados entre gesso e placas na proporção do valor das notas.
// Sem nota de placas (ou sem placas), tudo vai para o gesso — igual ao comportamento antigo.
export function splitTruckCosts(input: TruckCostInput): TruckCostSplit {
  const kg = safe(input.tonsGessoPo) * 1000;
  const plates = safe(input.platesQuantity);
  const gessoCost = kg > 0 ? safe(input.gessoCostTotal) : 0;
  const platesCost = plates > 0 ? safe(input.platesCostTotal) : 0;
  const extras = safe(input.freightCost) + safe(input.unloadingLaborCost);

  const goods = gessoCost + platesCost;
  const gessoShare = goods > 0 ? gessoCost / goods : kg > 0 ? 1 : 0;
  const platesShare = goods > 0 ? platesCost / goods : kg > 0 ? 0 : plates > 0 ? 1 : 0;

  const gessoTotalCost = gessoCost + extras * gessoShare;
  const platesTotalCost = platesCost + extras * platesShare;

  return {
    totalSpent: goods + extras,
    gessoTotalCost,
    platesTotalCost,
    costPerKg: kg > 0 ? gessoTotalCost / kg : 0,
    costPerPlate: plates > 0 ? platesTotalCost / plates : 0,
  };
}

// Custo médio ponderado após uma entrada
export function weightedAverageCost(currentQty: number, currentAvg: number, addedQty: number, addedCost: number): number {
  const totalQty = Math.max(currentQty, 0) + addedQty;
  if (totalQty <= 0) return currentAvg;
  return (Math.max(currentQty, 0) * currentAvg + addedCost) / totalQty;
}

// Inverso de weightedAverageCost: custo médio depois de retirar uma entrada (ex.: excluir uma carga lançada errada)
export function removeFromAverageCost(currentQty: number, currentAvg: number, removedQty: number, removedCost: number): number {
  const remainingQty = currentQty - removedQty;
  if (remainingQty <= 0 || removedCost <= 0) return currentAvg;
  return Math.max((currentQty * currentAvg - removedCost) / remainingQty, 0);
}
