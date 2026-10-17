import type { FormEvent } from 'react';
import { PackageCheck, Truck } from 'lucide-react';
import { splitTruckCosts } from '../../../utils/truckCost';
import type { TruckFormState } from './types';

interface TruckDeliveryFormProps {
  form: TruckFormState;
  onChange: (form: TruckFormState) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function TruckDeliveryForm({ form, onChange, onSubmit, onCancel }: TruckDeliveryFormProps) {
  const truckSplit = splitTruckCosts(form);

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200/80 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-brand-charcoal-dark flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-red" /> Lançar Carga Fechada (Caminhão)
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Lança as toneladas compradas e rateia frete e diárias de descarga para calcular o custo real por saco.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="truck-supplier" className="block text-xs font-semibold text-neutral-600 mb-1">Fornecedor / Origem</label>
          <input 
            id="truck-supplier"
            type="text" 
            required 
            value={form.supplier} 
            onChange={(e) => onChange({ ...form, supplier: e.target.value })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
          />
        </div>
        <div>
          <label htmlFor="truck-tons" className="block text-xs font-semibold text-neutral-600 mb-1">Toneladas de Gesso em Pó (T)</label>
          <input 
            id="truck-tons"
            type="number" 
            step="0.5" 
            required 
            value={form.tonsGessoPo} 
            onChange={(e) => onChange({ ...form, tonsGessoPo: Number(e.target.value) })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
          />
        </div>
        <div>
          <label htmlFor="truck-plates" className="block text-xs font-semibold text-neutral-600 mb-1">Placas 60x60 no Caminhão (un)</label>
          <input 
            id="truck-plates"
            type="number" 
            value={form.platesQuantity} 
            onChange={(e) => onChange({ ...form, platesQuantity: Number(e.target.value) })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
        <div>
          <label htmlFor="truck-mat-cost" className="block text-xs font-bold text-neutral-700 mb-1">Nota do Gesso em Pó (R$)</label>
          <input 
            id="truck-mat-cost"
            type="number" 
            required 
            value={form.gessoCostTotal} 
            onChange={(e) => onChange({ ...form, gessoCostTotal: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
          />
        </div>
        <div>
          <label htmlFor="truck-plates-cost" className="block text-xs font-bold text-neutral-700 mb-1">Nota das Placas (R$)</label>
          <input
            id="truck-plates-cost"
            type="number"
            min="0"
            disabled={!(form.platesQuantity > 0)}
            value={form.platesCostTotal}
            onChange={(e) => onChange({ ...form, platesCostTotal: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white disabled:bg-neutral-100 disabled:text-neutral-400"
          />
        </div>
        <div>
          <label htmlFor="truck-freight-cost" className="block text-xs font-bold text-neutral-700 mb-1">Frete do Caminhão (R$)</label>
          <input 
            id="truck-freight-cost"
            type="number" 
            required 
            value={form.freightCost} 
            onChange={(e) => onChange({ ...form, freightCost: Number(e.target.value) })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white" 
          />
        </div>
        <div>
          <label htmlFor="truck-labor-cost" className="block text-xs font-bold text-neutral-700 mb-1">Diária dos Chapas / Descarga (R$)</label>
          <input 
            id="truck-labor-cost"
            type="number" 
            required 
            value={form.unloadingLaborCost} 
            onChange={(e) => onChange({ ...form, unloadingLaborCost: Number(e.target.value) })} 
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white" 
          />
        </div>
      </div>

      <div className="bg-brand-charcoal-dark text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-400">Investimento Total na Carga:</p>
          <p className="text-xl font-black text-brand-red-light">
            {truckSplit.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-400">Custo Real Rateado (com frete e descarga):</p>
          <p className="text-lg font-bold text-emerald-400">
            {form.tonsGessoPo > 0
              ? `R$ ${(truckSplit.costPerKg * 20).toFixed(2)} / saco`
              : 'R$ 0,00 / saco'}
          </p>
          {form.platesQuantity > 0 && (
            <p className="text-xs font-bold text-emerald-300">
              {truckSplit.costPerPlate > 0
                ? `R$ ${truckSplit.costPerPlate.toFixed(2)} / placa`
                : 'Placas sem nota: custo médio das placas não muda'}
            </p>
          )}
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
          className="px-6 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold shadow-md flex items-center gap-2"
        >
          <PackageCheck className="w-4 h-4" /> Salvar Entrada no Banco
        </button>
      </div>
    </form>
  );
}
