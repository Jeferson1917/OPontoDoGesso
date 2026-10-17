// src/app/data/pricingConfig.ts

export const defaultPricingConfig = {
  // Margem de segurança para perdas e quebras de placa (10%)
  wasteFactor: 1.10,

  // Valores de Mão de Obra (R$)
  laborRates: {
    FORRO_PLAQUINHA_60X60: 35.0,    // R$/m²
    REVESTIMENTO_GESSO_LISO: 28.0,   // R$/m²
    SANCA_ABERTA_GESSO: 45.0,        // R$/metro linear
    SANCA_FECHADA_GESSO: 35.0,       // R$/metro linear
    MOLDURA_RODATOPO: 20.0,          // R$/metro linear
    CORTINEIRO_GESSO: 30.0,          // R$/metro linear
  },

  // Custos de Compra/Fornecimento de Materiais (R$)
  materialCosts: {
    placaGesso60x60: 4.5,       // R$/unidade (0.36 m²)
    gessoPo20kg: 26.0,          // R$/saco 20kg
    gessoColaKg: 3.5,           // R$/kg
    arameGalvanizado18Kg: 22.0, // R$/kg
    sisalJutaKg: 18.0,          // R$/kg (para chumbamento com gesso)
    pinoAcoOuPregoCento: 15.0,  // R$/cento (fixação no teto)
    metroMolduraFabricada: 8.0, // R$/m (custo de material da moldura)
  },

  // Regras Comerciais
  minimumProjectPrice: 300.0,    // Valor mínimo para cobrir deslocamento/dia de serviço
  profitMarginMultiplier: 1.35,  // 35% de margem sobre custo direto
};
export type PricingConfig = typeof defaultPricingConfig;

const LOWER_BOUND: Partial<Record<keyof PricingConfig, number>> = {
  profitMarginMultiplier: 1,
  wasteFactor: 1,
};

const validNumber = (value: unknown, min: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min ? value : fallback;

function mergeNumberMap<T extends Record<string, number>>(defaults: T, input: unknown): T {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    result[key] = validNumber(source[key as string], 0, defaults[key]) as T[keyof T];
  }
  return result;
}

// Completa com os padrões e descarta valores inválidos (negativos, NaN, chaves desconhecidas)
export function sanitizePricingConfig(input: unknown): PricingConfig {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  return {
    wasteFactor: validNumber(source.wasteFactor, LOWER_BOUND.wasteFactor!, defaultPricingConfig.wasteFactor),
    laborRates: mergeNumberMap(defaultPricingConfig.laborRates, source.laborRates),
    materialCosts: mergeNumberMap(defaultPricingConfig.materialCosts, source.materialCosts),
    minimumProjectPrice: validNumber(source.minimumProjectPrice, 0, defaultPricingConfig.minimumProjectPrice),
    profitMarginMultiplier: validNumber(source.profitMarginMultiplier, LOWER_BOUND.profitMarginMultiplier!, defaultPricingConfig.profitMarginMultiplier),
  };
}

// Materiais do orçamento que também existem no estoque: de onde vem o custo médio real
// (factor converte a unidade do estoque para a do orçamento; ex.: kg → saco de 20kg)
export const STOCK_COST_SOURCES: Partial<Record<keyof PricingConfig['materialCosts'], { itemKey: string; factor: number }>> = {
  placaGesso60x60: { itemKey: 'placaGesso60x60', factor: 1 },
  gessoPo20kg: { itemKey: 'gessoPoKg', factor: 20 },
  gessoColaKg: { itemKey: 'gessoColaKg', factor: 1 },
  arameGalvanizado18Kg: { itemKey: 'arameGalvanizadoKg', factor: 1 },
  sisalJutaKg: { itemKey: 'sisalKg', factor: 1 },
};
