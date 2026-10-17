import { AlertTriangle, History, RefreshCw } from 'lucide-react';
import type { StockBalanceRow, TruckDeliveryRow } from './types';
import { formatBusinessDate } from '../../../utils/dates';

interface StockOverviewProps {
  balances: StockBalanceRow[];
  deliveries: TruckDeliveryRow[];
  loading: boolean;
  onRefresh: () => void;
}

export function StockOverview({ balances, deliveries, loading, onRefresh }: StockOverviewProps) {
  return (
    <div className="space-y-6">
      {loading && balances.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((item) => {
            const isCritical = item.currentQuantity <= item.minThreshold;
            const isGessoPo = item.itemKey === 'gessoPoKg';

            return (
              <div 
                key={item.itemKey} 
                className={`bg-white p-5 rounded-2xl border shadow-sm space-y-4 ${
                  isCritical ? 'border-amber-400 bg-amber-50/20' : 'border-neutral-200/80'
                }`}
              >
                {isCritical && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg w-fit">
                    <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-brand-charcoal-dark text-base">{item.name}</h2>
                  <p className="text-xs text-neutral-400">{item.unit}</p>
                </div>
                <div className="flex items-baseline justify-between border-y border-neutral-100 py-3">
                  <div>
                    <span className="text-2xl font-black text-brand-charcoal-dark">
                      {item.currentQuantity.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400 ml-1">
                      {item.itemKey === 'placaGesso60x60' ? 'un' : 'kg'}
                    </span>
                  </div>
                  {isGessoPo && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-red">
                        {(item.currentQuantity / 1000).toFixed(2)} Toneladas
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        ~{(item.currentQuantity / 20).toFixed(0)} sacos 20kg
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Custo Médio</span>
                    <span className="font-bold text-neutral-700">
                      R$ {isGessoPo ? (item.averageUnitCost * 20).toFixed(2) + '/saco' : item.averageUnitCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <span className="text-emerald-600 block text-[10px] uppercase font-bold">Preço Balcão</span>
                    <span className="font-bold text-emerald-800">
                      R$ {isGessoPo ? (item.counterSalePrice * 20).toFixed(2) + '/saco' : item.counterSalePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HISTÓRICO DE CARGAS */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-charcoal-dark text-base flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-500" /> Entradas de Caminhões Recentes
          </h2>
          <button 
            type="button"
            onClick={onRefresh} 
            className="text-xs text-neutral-400 hover:text-brand-red flex items-center gap-1 font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>

        {deliveries.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center">Nenhuma carga registrada no banco ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase">
                  <th className="py-2.5">Data</th>
                  <th className="py-2.5">Fornecedor</th>
                  <th className="py-2.5 text-right">Volume</th>
                  <th className="py-2.5 text-right">Custo Rateado / Saco</th>
                  <th className="py-2.5 text-right">Valor Total Carga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 font-semibold text-neutral-600">
                      {formatBusinessDate(del.createdAt)}
                    </td>
                    <td className="py-3 text-neutral-700 font-bold">{del.supplier}</td>
                    <td className="py-3 text-right font-bold text-brand-charcoal-dark">
                      {del.tonsGessoPo} Toneladas
                    </td>
                    <td className="py-3 text-right text-emerald-700 font-bold">
                      R$ {(del.realCostPerKg * 20).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-black text-brand-red">
                      {(del.gessoCostTotal + (del.platesCostTotal ?? 0) + del.freightCost + del.unloadingLaborCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
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
