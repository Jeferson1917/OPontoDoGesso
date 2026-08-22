import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import { logoutAdmin } from '../actions/authActions';
import { 
  Calculator, 
  Package, 
  FileText, 
  Settings, 
  AlertTriangle, 
  LogOut, 
  ArrowUpRight 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [quotes, stockBalances, recentSales] = await Promise.all([
    prisma.quote.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.stockBalance.findMany(),
    prisma.counterSale.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  // Função utilitária para capturar o valor efetivo negociado de cada proposta
  const getEffectivePrice = (q: any) =>
    q.finalAgreedPrice && q.finalAgreedPrice > 0 ? q.finalAgreedPrice : q.suggestedFinalPrice;

  // Cálculos de Indicadores Financeiros
  const totalQuotesValue = quotes.reduce((acc, q) => acc + getEffectivePrice(q), 0);
  const approvedQuotes = quotes.filter(
    (q) => q.status === 'APROVADO' || q.status === 'EM_EXECUCAO' || q.status === 'CONCLUIDO'
  );
  const approvedRevenue = approvedQuotes.reduce((acc, q) => acc + getEffectivePrice(q), 0);
  
  const gessoItem = stockBalances.find((s) => s.itemKey === 'gessoPoKg');
  const tonsGesso = gessoItem ? (gessoItem.currentQuantity / 1000).toFixed(1) : '0';
  const isGessoLow = gessoItem ? gessoItem.currentQuantity <= gessoItem.minThreshold : false;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Topo do Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div>
            <span className="text-[11px] font-bold text-brand-red uppercase tracking-wider">Painel Administrativo</span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal-dark">O Ponto do Gesso</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Visão consolidada de orçamentos, estoque e faturamento.</p>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 text-xs font-bold transition-all border border-neutral-200"
            >
              <LogOut className="w-4 h-4" /> Sair do Sistema
            </button>
          </form>
        </div>

        {/* 4 Cards de Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase">Faturamento em Obras</span>
            <p className="text-2xl font-black text-emerald-600">
              {approvedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[11px] text-neutral-500">{approvedQuotes.length} obras aprovadas/concluídas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase">Propostas Emitidas</span>
            <p className="text-2xl font-black text-brand-charcoal-dark">
              {quotes.length}
            </p>
            <p className="text-[11px] text-neutral-500">Total em propostas: {totalQuotesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm space-y-2 ${isGessoLow ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-neutral-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase">Gesso em Pó</span>
              {isGessoLow && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            </div>
            <p className="text-2xl font-black text-brand-charcoal-dark">{tonsGesso} <span className="text-sm font-semibold">Toneladas</span></p>
            <p className="text-[11px] text-neutral-500">{isGessoLow ? 'Abaixo do mínimo! Pedir carga.' : 'Estoque seguro'}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase">Vendas no Balcão</span>
            <p className="text-2xl font-black text-brand-red">
              {recentSales.reduce((acc, s) => acc + s.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[11px] text-neutral-500">Últimas 5 saídas para gesseiros</p>
          </div>
        </div>

        {/* Módulos de Acesso Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/orcamento"
            className="group bg-brand-charcoal-dark hover:bg-brand-charcoal p-5 rounded-2xl text-white shadow-sm transition-all flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-white/10 text-white"><Calculator className="w-5 h-5" /></div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-base">Novo Orçamento</h3>
              <p className="text-[11px] text-neutral-400">Calculadora técnica com PDF</p>
            </div>
          </Link>

          <Link
            href="/admin/historico"
            className="group bg-white hover:border-brand-red p-5 rounded-2xl border border-neutral-200 shadow-sm transition-all flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-neutral-100 text-brand-charcoal-dark"><FileText className="w-5 h-5" /></div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-red transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-charcoal-dark">Histórico de Obras</h3>
              <p className="text-[11px] text-neutral-500">Gerenciar status e clientes</p>
            </div>
          </Link>

          <Link
            href="/admin/estoque"
            className="group bg-white hover:border-brand-red p-5 rounded-2xl border border-neutral-200 shadow-sm transition-all flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-neutral-100 text-brand-charcoal-dark"><Package className="w-5 h-5" /></div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-red transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-charcoal-dark">Estoque & Cargas</h3>
              <p className="text-[11px] text-neutral-500">Entrada de caminhão e balcão</p>
            </div>
          </Link>

          <Link
            href="/admin/precos"
            className="group bg-white hover:border-brand-red p-5 rounded-2xl border border-neutral-200 shadow-sm transition-all flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-neutral-100 text-brand-charcoal-dark"><Settings className="w-5 h-5" /></div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-red transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-charcoal-dark">Tabela de Preços</h3>
              <p className="text-[11px] text-neutral-500">Ajustar diárias e insumos</p>
            </div>
          </Link>
        </div>

        {/* Lista de Últimas Propostas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-charcoal-dark">Orçamentos Mais Recentes</h2>
            <Link href="/admin/historico" className="text-xs font-bold text-brand-red hover:underline">Ver todos</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase">
                  <th className="py-2.5">Cliente</th>
                  <th className="py-2.5">Metragem</th>
                  <th className="py-2.5">Valor Proposta</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {quotes.slice(0, 5).map((q) => (
                  <tr key={q.id}>
                    <td className="py-3 font-bold text-brand-charcoal-dark">{q.clientName}</td>
                    <td className="py-3 text-neutral-600 font-medium">{q.totalAreaM2.toFixed(2)} m²</td>
                    <td className="py-3 font-bold text-brand-red">
                      {getEffectivePrice(q).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}