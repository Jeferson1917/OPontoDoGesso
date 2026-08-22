// src/app/data/defaultStock.ts
import { StockItem } from './stockTypes';

export const initialStockState: Record<string, StockItem> = {
  gessoPoKg: {
    id: 'gessoPoKg',
    name: 'Gesso em Pó Tradicional',
    unit: 'kg (sacos de 20kg ou 40kg)',
    currentQuantity: 8000, // 8 toneladas em estoque
    minThreshold: 2500,    // Alerta com menos de 2.5 toneladas
    averageUnitCost: 0.65, // ~R$ 13,00 o saco de 20kg no frete
    counterSalePrice: 1.10, // ~R$ 22,00 o saco pro gesseiro de fora
  },
  placaGesso60x60: {
    id: 'placaGesso60x60',
    name: 'Placa de Gesso 60x60cm',
    unit: 'unidades',
    currentQuantity: 1200,
    minThreshold: 400,
    averageUnitCost: 2.80,
    counterSalePrice: 4.80, // Preço balcão unitário
  },
  gessoColaKg: {
    id: 'gessoColaKg',
    name: 'Gesso Cola para Fixação e Molduras',
    unit: 'kg (sacos de 5kg ou 20kg)',
    currentQuantity: 300,
    minThreshold: 80,
    averageUnitCost: 1.90,
    counterSalePrice: 3.50,
  },
  arameGalvanizadoKg: {
    id: 'arameGalvanizadoKg',
    name: 'Arame Galvanizado nº 18',
    unit: 'kg',
    currentQuantity: 80,
    minThreshold: 25,
    averageUnitCost: 14.00,
    counterSalePrice: 22.00,
  },
  sisalKg: {
    id: 'sisalKg',
    name: 'Fardo de Sisal Desfiado / Juta',
    unit: 'kg',
    currentQuantity: 60,
    minThreshold: 20,
    averageUnitCost: 9.50,
    counterSalePrice: 15.00,
  },
};