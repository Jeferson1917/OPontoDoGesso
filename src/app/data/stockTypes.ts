// src/app/data/stockTypes.ts

export const STOCK_ITEM_KEYS = ['gessoPoKg', 'placaGesso60x60', 'gessoColaKg', 'arameGalvanizadoKg', 'sisalKg'] as const;

export type StockItemKey = (typeof STOCK_ITEM_KEYS)[number];

// Rótulo curto (com unidade) usado em listas, selects e histórico
export const STOCK_ITEM_LABELS: Record<StockItemKey, string> = {
  gessoPoKg: 'Gesso em Pó (kg)',
  placaGesso60x60: 'Placa de Gesso 60x60cm (un)',
  gessoColaKg: 'Gesso Cola (kg)',
  arameGalvanizadoKg: 'Arame Galvanizado nº 18 (kg)',
  sisalKg: 'Sisal / Juta (kg)',
};

export const stockItemLabel = (key: string) => STOCK_ITEM_LABELS[key as StockItemKey] ?? key;
