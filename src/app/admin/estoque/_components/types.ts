import type { getStockDataAction } from '../../../actions/stockActions';
import type { StockItemKey } from '../../../data/stockTypes';

export type StockDataResult = Awaited<ReturnType<typeof getStockDataAction>>;
export type StockData = Extract<StockDataResult, { success: true }>;
export type StockBalanceRow = StockData['balances'][number];
export type TruckDeliveryRow = StockData['deliveries'][number];
export type StockAdjustmentRow = StockData['adjustments'][number];

export const initialTruckForm = {
  supplier: 'Polo do Araripe / Gipsita',
  tonsGessoPo: 10,
  platesQuantity: 0,
  gessoCostTotal: 5500,
  platesCostTotal: 0,
  freightCost: 2200,
  unloadingLaborCost: 400,
  notes: '',
};
export type TruckFormState = typeof initialTruckForm;

export const initialSaleForm = {
  itemKey: 'gessoPoKg' as StockItemKey,
  quantity: 20,
  unitPrice: 1.1,
  customerName: '',
};
export type SaleFormState = typeof initialSaleForm;
