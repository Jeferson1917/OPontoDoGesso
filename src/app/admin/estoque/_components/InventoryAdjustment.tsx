import { useState, type FormEvent } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { STOCK_ITEM_KEYS, STOCK_ITEM_LABELS, stockItemLabel, type StockItemKey } from '../../../data/stockTypes';
import { formatBusinessDate } from '../../../utils/dates';
import type { StockAdjustmentRow, StockBalanceRow } from './types';

interface InventoryAdjustmentProps {
  balances: StockBalanceRow[];
  adjustments: StockAdjustmentRow[];
  onSubmit: (data: { itemKey: StockItemKey; countedQuantity: number; reason: string }) => Promise<boolean>;
}

const fmt = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function InventoryAdjustment({ balances, adjustments, onSubmit }: InventoryAdjustmentProps) {
  const [itemKey, setItemKey] = useState<StockItemKey>('gessoPoKg');
  const [counted, setCounted] = useState<string>('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const current = balances.find((b) => b.itemKey === itemKey);
  const countedNumber = counted === '' ? null : Number(counted);
  const difference = current && countedNumber !== null && Number.isFinite(countedNumber) ? countedNumber - current.currentQuantity : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (countedNumber === null) return;
    setSaving(true);
    const ok = await onSubmit({ itemKey, countedQuantity: countedNumber, reason });
    setSaving(false);
    if (ok) {
      setCounted('');
      setReason('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200/80 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-brand-charcoal-dark flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-brand-red" /> Ajuste de Inventário
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Use depois de uma contagem física, perda ou quebra: o saldo passa a ser a quantidade contada. O custo médio não muda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="adjust-item" className="block text-xs font-semibold text-neutral-600 mb-1">Item</label>
            <select
              id="adjust-item"
              value={itemKey}
              onChange={(e) => { setItemKey(e.target.value as StockItemKey); setCounted(''); }}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
            >
              {STOCK_ITEM_KEYS.map((key) => (
                <option key={key} value={key}>{STOCK_ITEM_LABELS[key]}</option>
              ))}
            </select>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Saldo no sistema: <strong>{current ? `${fmt(current.currentQuantity)} ${current.unit}` : '—'}</strong>
            </span>
          </div>
          <div>
            <label htmlFor="adjust-counted" className="block text-xs font-semibold text-neutral-600 mb-1">Quantidade contada</label>
            <input
              id="adjust-counted"
              type="number"
              min="0"
              step="any"
              required
              value={counted}
              onChange={(e) => setCounted(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
            />
            {difference !== null && difference !== 0 && (
              <span className={`text-[11px] font-bold mt-1 block ${difference < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {difference > 0 ? '+' : ''}{fmt(difference)} {current?.unit}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="adjust-reason" className="block text-xs font-semibold text-neutral-600 mb-1">Motivo</label>
            <input
              id="adjust-reason"
              type="text"
              required
              minLength={3}
              maxLength={300}
              placeholder="Ex.: contagem de fim de mês, sacos molhados"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-charcoal-dark hover:bg-neutral-800 disabled:opacity-60 text-white text-xs font-bold shadow-md"
          >
            {saving ? 'Salvando...' : 'Registrar Ajuste'}
          </button>
        </div>
      </form>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 space-y-4">
        <h2 className="font-bold text-brand-charcoal-dark text-base">Ajustes Recentes</h2>
        {adjustments.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center">Nenhum ajuste registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase">
                  <th className="py-2.5">Data</th>
                  <th className="py-2.5">Item</th>
                  <th className="py-2.5 text-right">Antes</th>
                  <th className="py-2.5 text-right">Depois</th>
                  <th className="py-2.5 text-right">Diferença</th>
                  <th className="py-2.5 pl-4">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {adjustments.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 text-neutral-600">{formatBusinessDate(a.createdAt)}</td>
                    <td className="py-3 font-bold text-neutral-700">{stockItemLabel(a.itemKey)}</td>
                    <td className="py-3 text-right">{fmt(a.previousQuantity)}</td>
                    <td className="py-3 text-right">{fmt(a.newQuantity)}</td>
                    <td className={`py-3 text-right font-bold ${a.difference < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {a.difference > 0 ? '+' : ''}{fmt(a.difference)}
                    </td>
                    <td className="py-3 pl-4 text-neutral-600">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
