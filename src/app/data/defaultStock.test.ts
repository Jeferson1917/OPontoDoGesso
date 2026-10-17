import { describe, expect, it } from 'vitest';
import { defaultStockItems } from './defaultStock';
import { STOCK_ITEM_KEYS } from './stockTypes';

describe('estoque inicial', () => {
  it('cria todos os itens com saldo e custo zerados (nada inventado)', () => {
    expect(defaultStockItems.map((i) => i.itemKey)).toEqual([...STOCK_ITEM_KEYS]);
    for (const item of defaultStockItems) {
      expect(item.currentQuantity).toBe(0);
      expect(item.averageUnitCost).toBe(0);
    }
  });
});
