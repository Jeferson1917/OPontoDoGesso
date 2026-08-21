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