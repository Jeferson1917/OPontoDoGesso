'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import {
  getStockDataAction,
  registerTruckDeliveryAction,
  registerCounterSaleAction,
} from '../../actions/stockActions';
import { toast } from 'sonner';
import { Truck, ArrowLeft, ShoppingCart, Layers } from 'lucide-react';
import { StockOverview } from './_components/StockOverview';
import { TruckDeliveryForm } from './_components/TruckDeliveryForm';
import { CounterSaleForm } from './_components/CounterSaleForm';
import {
  initialSaleForm,
  initialTruckForm,
  type StockBalanceRow,
  type StockDataResult,
  type TruckDeliveryRow,
} from './_components/types';

export default function AdminStockPage() {
  const [balances, setBalances] = useState<StockBalanceRow[]>([]);
  const [deliveries, setDeliveries] = useState<TruckDeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PANORAMA' | 'CAMINHAO' | 'BALCAO'>('PANORAMA');

  const [truckForm, setTruckForm] = useState(initialTruckForm);
  const [saleForm, setSaleForm] = useState(initialSaleForm);

  const applyStockData = (res: StockDataResult) => {
    if (res.success) {
      setBalances(res.balances);
      setDeliveries(res.deliveries);
    } else {
      toast.error(res.error || 'Erro ao carregar dados do estoque.');
    }
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    applyStockData(await getStockDataAction());
  };

  useEffect(() => {
    getStockDataAction().then(applyStockData);
  }, []);

  const handleRegisterTruck = async (e: FormEvent<HTMLFormElement>) => {
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

  const handleRegisterCounterSale = async (e: FormEvent<HTMLFormElement>) => {
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


  return (
    <main className="min-h-screen bg-[#f8f9fa] text-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80">
          <div className="space-y-1">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-red transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Geral
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-dark tracking-tight">
              Controle de Estoque & Cargas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Sincronizado em tempo real no banco de dados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
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
              type="button"
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
              type="button"
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
        </header>

        {/* CONTAINER COM ALTURA MÍNIMA PARA EVITAR CLS */}
        <div className="min-h-[420px]">
          {/* ABA 1: PANORAMA GERAL */}
          {activeTab === 'PANORAMA' && (
            <StockOverview balances={balances} deliveries={deliveries} loading={loading} onRefresh={fetchData} />
          )}

          {/* ABA 2: ENTRADA DE CAMINHÃO */}
          {activeTab === 'CAMINHAO' && (
            <TruckDeliveryForm
              form={truckForm}
              onChange={setTruckForm}
              onSubmit={handleRegisterTruck}
              onCancel={() => setActiveTab('PANORAMA')}
            />
          )}

          {/* ABA 3: VENDA DE BALCÃO */}
          {activeTab === 'BALCAO' && (
            <CounterSaleForm
              form={saleForm}
              balances={balances}
              onChange={setSaleForm}
              onSubmit={handleRegisterCounterSale}
              onCancel={() => setActiveTab('PANORAMA')}
            />
          )}
        </div>

      </div>
    </main>
  );
}