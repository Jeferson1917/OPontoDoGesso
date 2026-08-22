'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getStockDataAction, 
  registerTruckDeliveryAction, 
  registerCounterSaleAction 
} from '../../actions/stockActions';
import { toast } from 'sonner';
import { 
  Truck, 
  PackageCheck, 
  ArrowLeft, 
  AlertTriangle, 
  ShoppingCart, 
  Layers, 
  TrendingUp, 
  History, 
  RefreshCw 
} from 'lucide-react';

export default function AdminStockPage() {
  const [balances, setBalances] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PANORAMA' | 'CAMINHAO' | 'BALCAO'>('PANORAMA');

  const [truckForm, setTruckForm] = useState({
    supplier: 'Polo do Araripe / Gipsita',
    tonsGessoPo: 10,
    platesQuantity: 0,
    gessoCostTotal: 5500,
    freightCost: 2200,
    unloadingLaborCost: 400,
    notes: '',
  });

  const [saleForm, setSaleForm] = useState({
    itemKey: 'gessoPoKg',
    quantity: 20,
    unitPrice: 1.10,
    customerName: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await getStockDataAction();
    if (res.success) {
      setBalances(res.balances || []);
      setDeliveries(res.deliveries || []);
      setSales(res.sales || []);
    } else {
      toast.error('Erro ao carregar dados do estoque.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Registrando carga de caminhão...');
    const res = await registerTruckDeliveryAction(truckForm);
    if (res.success) {
      toast.success(`Carga de ${truckForm.tonsGessoPo}T lançada com sucesso!`, { id: toastId });
      setActiveTab('PANORAMA');
      fetchData();
    } else {
      toast.error(res.error || 'Erro ao registrar carga.', { id: toastId });
    }
  };

  const handleRegisterCounterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Processando venda de balcão...');
    const res = await registerCounterSaleAction(saleForm);
    if (res.success) {
      toast.success('Venda concluída e estoque baixado!', { id: toastId });
      setActiveTab('PANORAMA');
      fetchData();
    } else {
      toast.error(res.error || 'Erro na venda.', { id: toastId });
    }
  };

  // Encontra o item selecionado para cálculos de preço de balcão
  const selectedBalanceItem = balances.find((b) => b.itemKey === saleForm.itemKey);
  const currentAvgCost = selectedBalanceItem ? selectedBalanceItem.averageUnitCost : 0;
  const estimatedProfit = (saleForm.quantity * saleForm.unitPrice) - (saleForm.quantity * currentAvgCost);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="space-y-1">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-red transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Geral
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-dark">
              Controle de Estoque & Cargas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Sincronizado em tempo real no banco de dados na nuvem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('PANORAMA')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PANORAMA' 
                  ? 'bg-brand-charcoal-dark text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-1" /> Saldo
            </button>
            <button 
              onClick={() => setActiveTab('CAMINHAO')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'CAMINHAO' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-1" /> Entrada Caminhão
            </button>
            <button 
              onClick={() => setActiveTab('BALCAO')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'BALCAO' 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-1" /> Venda Balcão
            </button>
          </div>
        </div>

        {/* ABA 1: PANORAMA GERAL */}
        {activeTab === 'PANORAMA' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((item) => {
                const isCritical = item.currentQuantity <= item.minThreshold;
                const isGessoPo = item.itemKey === 'gessoPoKg';

                return (
                  <div 
                    key={item.itemKey} 
                    className={`bg-white p-5 rounded-2xl border shadow-sm space-y-4 ${
                      isCritical ? 'border-amber-400 bg-amber-50/20' : 'border-neutral-200'
                    }`}
                  >
                    {isCritical && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg w-fit">
                        <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-brand-charcoal-dark text-base">{item.name}</h3>
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

            {/* Histórico Consolidado de Cargas */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-brand-charcoal-dark text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-neutral-500" /> Entradas de Caminhões Recentes
                </h3>
                <button 
                  onClick={fetchData} 
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
                            {new Date(del.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 text-neutral-700 font-bold">{del.supplier}</td>
                          <td className="py-3 text-right font-bold text-brand-charcoal-dark">
                            {del.tonsGessoPo} Toneladas
                          </td>
                          <td className="py-3 text-right text-emerald-700 font-bold">
                            R$ {(del.realCostPerKg * 20).toFixed(2)}
                          </td>
                          <td className="py-3 text-right font-black text-brand-red">
                            {(del.gessoCostTotal + del.freightCost + del.unloadingLaborCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 2: ENTRADA DE CAMINHÃO */}
        {activeTab === 'CAMINHAO' && (
          <form onSubmit={handleRegisterTruck} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
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
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Fornecedor / Origem</label>
                <input 
                  type="text" 
                  required 
                  value={truckForm.supplier} 
                  onChange={(e) => setTruckForm({ ...truckForm, supplier: e.target.value })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Toneladas de Gesso em Pó (T)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  required 
                  value={truckForm.tonsGessoPo} 
                  onChange={(e) => setTruckForm({ ...truckForm, tonsGessoPo: Number(e.target.value) })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Placas 60x60 no Caminhão (un)</label>
                <input 
                  type="number" 
                  value={truckForm.platesQuantity} 
                  onChange={(e) => setTruckForm({ ...truckForm, platesQuantity: Number(e.target.value) })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Material na Fábrica (R$)</label>
                <input 
                  type="number" 
                  required 
                  value={truckForm.gessoCostTotal} 
                  onChange={(e) => setTruckForm({ ...truckForm, gessoCostTotal: Number(e.target.value) })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Frete do Caminhão (R$)</label>
                <input 
                  type="number" 
                  required 
                  value={truckForm.freightCost} 
                  onChange={(e) => setTruckForm({ ...truckForm, freightCost: Number(e.target.value) })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Diária dos Chapas / Descarga (R$)</label>
                <input 
                  type="number" 
                  required 
                  value={truckForm.unloadingLaborCost} 
                  onChange={(e) => setTruckForm({ ...truckForm, unloadingLaborCost: Number(e.target.value) })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white" 
                />
              </div>
            </div>

            <div className="bg-brand-charcoal-dark text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-400">Investimento Total na Carga:</p>
                <p className="text-xl font-black text-brand-red-light">
                  {(Number(truckForm.gessoCostTotal) + Number(truckForm.freightCost) + Number(truckForm.unloadingLaborCost)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-neutral-400">Custo Real Rateado por Saco de 20kg:</p>
                <p className="text-lg font-bold text-emerald-400">
                  {truckForm.tonsGessoPo > 0
                    ? `R$ ${(((Number(truckForm.gessoCostTotal) + Number(truckForm.freightCost) + Number(truckForm.unloadingLaborCost)) / (truckForm.tonsGessoPo * 1000)) * 20).toFixed(2)} / saco`
                    : 'R$ 0,00'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setActiveTab('PANORAMA')} 
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
        )}

        {/* ABA 3: VENDA DE BALCÃO PARA GESSEIROS */}
        {activeTab === 'BALCAO' && (
          <form onSubmit={handleRegisterCounterSale} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
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
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Nome do Cliente / Gesseiro</label>
                <input 
                  type="text" 
                  placeholder="Ex: Seu Carlos Gesseiro" 
                  value={saleForm.customerName} 
                  onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Item Vendido</label>
                <select 
                  value={saleForm.itemKey} 
                  onChange={(e) => {
                    const id = e.target.value;
                    const item = balances.find((b) => b.itemKey === id);
                    setSaleForm({
                      ...saleForm,
                      itemKey: id,
                      unitPrice: item ? item.counterSalePrice : 1.0,
                    });
                  }} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
                >
                  <option value="gessoPoKg">Gesso em Pó (kg)</option>
                  <option value="placaGesso60x60">Placa de Gesso 60x60cm (un)</option>
                  <option value="gessoColaKg">Gesso Cola (kg)</option>
                  <option value="arameGalvanizadoKg">Arame Galvanizado nº 18 (kg)</option>
                  <option value="sisalKg">Sisal / Juta (kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Quantidade ({saleForm.itemKey === 'placaGesso60x60' ? 'unidades' : 'kg'})
                </label>
                <input 
                  type="number" 
                  step="1" 
                  required 
                  value={saleForm.quantity} 
                  onChange={(e) => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
                />
                {saleForm.itemKey === 'gessoPoKg' && (
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    {(saleForm.quantity / 20).toFixed(1)} sacos de 20kg
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Preço Unitário Cobrado (R$)</label>
                <input 
                  type="number" 
                  step="0.05" 
                  required 
                  value={saleForm.unitPrice} 
                  onChange={(e) => setSaleForm({ ...saleForm, unitPrice: Number(e.target.value) })} 
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red" 
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-800 font-bold">Valor Total a Cobrar:</p>
                <p className="text-xl font-black text-emerald-900">
                  {(saleForm.quantity * saleForm.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                onClick={() => setActiveTab('PANORAMA')} 
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
        )}

      </div>
    </div>
  );
}