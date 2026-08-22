// src/app/data/stockTypes.ts

export type StockItemKey = 
  | 'gessoPoKg' 
  | 'placaGesso60x60' 
  | 'gessoColaKg' 
  | 'arameGalvanizadoKg' 
  | 'sisalKg';

export interface StockItem {
  id: StockItemKey;
  name: string;
  unit: string;
  currentQuantity: number;
  minThreshold: number; // Ponto de reposição / Pedir caminhão
  averageUnitCost: number; // Custo de aquisição (com frete e descarga)
  counterSalePrice: number; // Preço de venda direta no balcão pro gesseiro
}

export interface TruckDeliveryInput {
  date: string;
  supplier: string; // Ex: Polo do Araripe / Gipsita
  tonsGessoPo: number; // Ex: 10 ou 14 toneladas
  platesQuantity: number; // Quantidade de plaquinhas no caminhão (se houver)
  gessoCostTotal: number; // Valor das notas dos materiais
  freightCost: number; // Valor pago ao caminhoneiro/transportadora
  unloadingLaborCost: number; // Diária dos chapas para descarregar
  notes?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'ENTRADA_CAMINHAO' | 'VENDA_BALCAO_GESSEIRO' | 'CONSUMO_OBRA' | 'AJUSTE_PERDA';
  itemId: StockItemKey;
  quantity: number;
  unitPriceOrCost: number;
  totalValue: number;
  description: string;
}