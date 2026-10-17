// src/app/data/defaultStock.ts
import type { StockItemKey } from './stockTypes';

// Itens criados na primeira vez que a tela de estoque é aberta com o banco vazio.
// Saldo e custo começam em zero: entram pela primeira carga de caminhão ou por ajuste de inventário.
// Ponto de reposição e preço de balcão são só sugestões iniciais.
export const defaultStockItems: {
  itemKey: StockItemKey;
  name: string;
  unit: string;
  currentQuantity: number;
  minThreshold: number;     // Ponto de reposição / pedir caminhão
  averageUnitCost: number;  // Custo de aquisição (com frete e descarga); zero até a primeira entrada
  counterSalePrice: number; // Preço de venda direta no balcão
}[] = [
  { itemKey: 'gessoPoKg', name: 'Gesso em Pó Tradicional', unit: 'kg', currentQuantity: 0, minThreshold: 2500, averageUnitCost: 0, counterSalePrice: 1.10 },
  { itemKey: 'placaGesso60x60', name: 'Placa de Gesso 60x60cm', unit: 'unidades', currentQuantity: 0, minThreshold: 400, averageUnitCost: 0, counterSalePrice: 4.80 },
  { itemKey: 'gessoColaKg', name: 'Gesso Cola', unit: 'kg', currentQuantity: 0, minThreshold: 80, averageUnitCost: 0, counterSalePrice: 3.50 },
  { itemKey: 'arameGalvanizadoKg', name: 'Arame Galvanizado nº 18', unit: 'kg', currentQuantity: 0, minThreshold: 25, averageUnitCost: 0, counterSalePrice: 22.00 },
  { itemKey: 'sisalKg', name: 'Sisal / Juta', unit: 'kg', currentQuantity: 0, minThreshold: 20, averageUnitCost: 0, counterSalePrice: 15.00 },
];
