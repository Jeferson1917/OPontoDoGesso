import type { FormEvent } from 'react';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import { STOCK_ITEM_KEYS, STOCK_ITEM_LABELS, type StockItemKey } from '../../../data/stockTypes';
import type { SaleFormState, StockBalanceRow } from './types';

interface CounterSaleFormProps {
  form: SaleFormState;
  balances: StockBalanceRow[];
  onChange: (form: SaleFormState) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function CounterSaleForm({ form, balances, onChange, onSubmit, onCancel }: CounterSaleFormProps) {
  const selectedBalanceItem = balances.find((b) => b.itemKey === form.itemKey);
  const currentAvgCost = selectedBalanceItem ? selectedBalanceItem.averageUnitCost : 0;
  const estimatedProfit = form.quantity * form.unitPrice - form.quantity * currentAvgCost;

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200/80 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-brand-charcoal-dark flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600" /> Venda de Balcão (Revenda para Gesseiro)
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Lançamento rápido para gesseiros autônomos e clientes que compram placas ou sacos no galpão.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sale-customer" className="block text-xs font-semibold text-neutral-600 mb-1">Nome do Cliente / Gesseiro</label>
          <input 
            id="sale-customer"
            type="text" 
            placeholder="Ex: Seu Carlos Gesseiro" 
            value={form.customerName} 
            onChange={(e) => onChange({ ...form, customerName: e.target.value })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
          />
        </div>

        <div>
          <label htmlFor="sale-item" className="block text-xs font-semibold text-neutral-600 mb-1">Item Vendido</label>
          <select 
            id="sale-item"
            value={form.itemKey} 
            onChange={(e) => {
              const id = e.target.value as StockItemKey;
              const item = balances.find((b) => b.itemKey === id);
              onChange({
                ...form,
                itemKey: id,
                unitPrice: item ? item.counterSalePrice : 1.0,
              });
            }} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
          >
            {STOCK_ITEM_KEYS.map((key) => (
              <option key={key} value={key}>{STOCK_ITEM_LABELS[key]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sale-qty" className="block text-xs font-semibold text-neutral-600 mb-1">
            Quantidade ({form.itemKey === 'placaGesso60x60' ? 'unidades' : 'kg'})
          </label>
          <input 
            id="sale-qty"
            type="number" 
            step="1" 
            required 
            value={form.quantity} 
            onChange={(e) => onChange({ ...form, quantity: Number(e.target.value) })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
          />
          {form.itemKey === 'gessoPoKg' && (
            <span className="text-[11px] text-neutral-400 mt-1 block">
              {(form.quantity / 20).toFixed(1)} sacos de 20kg
            </span>
          )}
        </div>

        <div>
          <label htmlFor="sale-price" className="block text-xs font-semibold text-neutral-600 mb-1">Preço Unitário Cobrado (R$)</label>
          <input 
            id="sale-price"
            type="number" 
            step="0.05" 
            required 
            value={form.unitPrice} 
            onChange={(e) => onChange({ ...form, unitPrice: Number(e.target.value) })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
          />
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-800 font-bold">Valor Total a Cobrar:</p>
          <p className="text-xl font-black text-emerald-900">
            {(form.quantity * form.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-emerald-700">Lucro Líquido Estimado:</p>
          <p className="text-sm font-bold text-emerald-800">
            + {estimatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-bold hover:bg-neutral-200"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" /> Confirmar Venda & Baixar Estoque
        </button>
      </div>
    </form>
  );
}
