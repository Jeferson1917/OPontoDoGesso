// src/app/data/defaultStock.ts
import type { StockItemKey } from './stockTypes';

// Estoque inicial criado na primeira vez que a tela de estoque é aberta com o banco vazio
export const defaultStockItems: {
  itemKey: StockItemKey;
  name: string;
  unit: string;
  currentQuantity: number;
  minThreshold: number;     // Ponto de reposição / pedir caminhão
  averageUnitCost: number;  // Custo de aquisição (com frete e descarga)
  counterSalePrice: number; // Preço de venda direta no balcão
}[] = [
  { itemKey: 'gessoPoKg', name: 'Gesso em Pó Tradicional', unit: 'kg', currentQuantity: 8000, minThreshold: 2500, averageUnitCost: 0.65, counterSalePrice: 1.10 },
  { itemKey: 'placaGesso60x60', name: 'Placa de Gesso 60x60cm', unit: 'unidades', currentQuantity: 1200, minThreshold: 400, averageUnitCost: 2.80, counterSalePrice: 4.80 },
  { itemKey: 'gessoColaKg', name: 'Gesso Cola', unit: 'kg', currentQuantity: 300, minThreshold: 80, averageUnitCost: 1.90, counterSalePrice: 3.50 },
  { itemKey: 'arameGalvanizadoKg', name: 'Arame Galvanizado nº 18', unit: 'kg', currentQuantity: 80, minThreshold: 25, averageUnitCost: 14.00, counterSalePrice: 22.00 },
  { itemKey: 'sisalKg', name: 'Sisal / Juta', unit: 'kg', currentQuantity: 60, minThreshold: 20, averageUnitCost: 9.50, counterSalePrice: 15.00 },
];
