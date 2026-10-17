'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Trash2, Wallet } from 'lucide-react';
import { addPaymentAction, deletePaymentAction } from '../../actions/paymentActions';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, summarizePayments, type PaymentMethod } from '../../utils/payments';
import { businessTodayInput, formatBusinessDate } from '../../utils/dates';

export interface PaymentRow {
  id: string;
  amount: number;
  method: string;
  paidAt: Date | string;
  notes: string | null;
}

interface PaymentsPanelProps {
  quoteId: string;
  total: number;
  cancelled: boolean;
  payments: PaymentRow[];
  onChanged: () => void;
}

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PaymentsPanel({ quoteId, total, cancelled, payments, onChanged }: PaymentsPanelProps) {
  const { paid, remaining } = summarizePayments(total, payments);
  const [amount, setAmount] = useState(remaining > 0 ? String(remaining) : '');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [paidAt, setPaidAt] = useState(businessTodayInput());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const res = await addPaymentAction({ quoteId, amount: Number(amount), method, paidAt, notes });
    setSaving(false);
    if (res.success) {
      toast.success('Pagamento lançado.');
      setNotes('');
      onChanged();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (payment: PaymentRow) => {
    if (!confirm(`Excluir o pagamento de ${brl(payment.amount)} de ${formatBusinessDate(payment.paidAt)}?`)) return;
    const res = await deletePaymentAction(payment.id);
    if (res.success) {
      toast.success('Pagamento excluído.');
      onChanged();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
        <span className="font-bold text-brand-charcoal-dark flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-brand-red" /> Pagamentos
        </span>
        <span>Valor da obra: <strong>{brl(total)}</strong></span>
        <span className="text-emerald-700">Recebido: <strong>{brl(paid)}</strong></span>
        <span className={remaining > 0 ? 'text-amber-700' : 'text-emerald-700'}>Falta: <strong>{brl(remaining)}</strong></span>
      </div>

      {payments.length > 0 && (
        <table className="w-full text-left text-xs bg-white rounded-xl border border-neutral-200">
          <thead>
            <tr className="text-neutral-400 font-bold uppercase border-b border-neutral-200">
              <th className="p-2">Data</th>
              <th className="p-2">Forma</th>
              <th className="p-2 text-right">Valor</th>
              <th className="p-2">Observação</th>
              <th className="p-2 w-10"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="p-2">{formatBusinessDate(p.paidAt)}</td>
                <td className="p-2">{PAYMENT_METHOD_LABELS[p.method as PaymentMethod] ?? p.method}</td>
                <td className="p-2 text-right font-bold text-emerald-700">{brl(p.amount)}</td>
                <td className="p-2 text-neutral-500">{p.notes}</td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600"
                    aria-label={`Excluir pagamento de ${brl(p.amount)}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {cancelled ? (
        <p className="text-xs text-neutral-500">Obra cancelada: não recebe novos pagamentos.</p>
      ) : remaining <= 0 ? (
        <p className="text-xs font-bold text-emerald-700">Obra quitada.</p>
      ) : (
        <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
          <div>
            <label htmlFor={`pay-amount-${quoteId}`} className="block text-[10px] font-bold text-neutral-600 uppercase">Valor (R$)</label>
            <input
              id={`pay-amount-${quoteId}`}
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white"
            />
          </div>
          <div>
            <label htmlFor={`pay-method-${quoteId}`} className="block text-[10px] font-bold text-neutral-600 uppercase">Forma</label>
            <select
              id={`pay-method-${quoteId}`}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`pay-date-${quoteId}`} className="block text-[10px] font-bold text-neutral-600 uppercase">Data</label>
            <input
              id={`pay-date-${quoteId}`}
              type="date"
              required
              max={businessTodayInput()}
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white"
            />
          </div>
          <div>
            <label htmlFor={`pay-notes-${quoteId}`} className="block text-[10px] font-bold text-neutral-600 uppercase">Observação</label>
            <input
              id={`pay-notes-${quoteId}`}
              type="text"
              maxLength={300}
              placeholder="Ex.: sinal 50%"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold"
          >
            {saving ? 'Lançando...' : 'Lançar pagamento'}
          </button>
        </form>
      )}
    </div>
  );
}
