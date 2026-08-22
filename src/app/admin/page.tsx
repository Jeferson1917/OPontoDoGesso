// src/app/admin/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '../../lib/prisma';
import { logoutAdmin } from '../actions/authActions';
import DashboardCharts from './DashboardCharts';
import { 
  Calculator, 
  Package, 
  FileText, 
  Settings, 
  AlertTriangle, 
  LogOut, 
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Layers,
  Clock,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [quotes, stockBalances, recentSales, truckDeliveries] = await Promise.all([
    prisma.quote.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.stockBalance.findMany(),
    prisma.counterSale.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.truckDelivery.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  // Função utilitária para pegar o valor efetivo negociado
  const getEffectivePrice = (q: any) =>
    q.finalAgreedPrice && q.finalAgreedPrice > 0 ? q.finalAgreedPrice : q.suggestedFinalPrice;

  // Métricas Consolidadas
  const totalQuotesValue = quotes.reduce((acc, q) => acc + getEffectivePrice(q), 0);
  const approvedQuotes = quotes.filter(
    (q) => q.status === 'APROVADO' || q.status === 'EM_EXECUCAO' || q.status === 'CONCLUIDO'
  );
  const approvedRevenue = approvedQuotes.reduce((acc, q) => acc + getEffectivePrice(q), 0);
  const counterSalesRevenue = recentSales.reduce((acc, s) => acc + s.totalValue, 0);

  const gessoItem = stockBalances.find((s) => s.itemKey === 'gessoPoKg');
  const placaItem = stockBalances.find((s) => s.itemKey === 'placaGesso60x60');
  
  const tonsGesso = gessoItem ? (gessoItem.currentQuantity / 1000).toFixed(1) : '0';
  const totalPlacas = placaItem ? placaItem.currentQuantity : 0;
  const isGessoLow = gessoItem ? gessoItem.currentQuantity <= gessoItem.minThreshold : false;

  // Agrupamento dos últimos 6 meses para os Gráficos
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  const monthlyMap = new Map<string, { faturamento: number; lucro: number; custo: number; gessoEntradaTon: number; gessoSaidaTon: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
    monthlyMap.set(key, { faturamento: 0, lucro: 0, custo: 0, gessoEntradaTon: 0, gessoSaidaTon: 0 });
  }

  for (const q of approvedQuotes) {
    const d = new Date(q.createdAt);
    const key = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
    if (monthlyMap.has(key)) {
      const current = monthlyMap.get(key)!;
      const price = getEffectivePrice(q);
      const estimatedCost = price * 0.62;
      const estimatedProfit = price - estimatedCost;

      current.faturamento += price;
      current.lucro += estimatedProfit;
      current.custo += estimatedCost;
      current.gessoSaidaTon += (q.totalAreaM2 * 2.5) / 1000;
    }
  }

  for (const s of recentSales) {
    const d = new Date(s.createdAt);
    const key = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
    if (monthlyMap.has(key)) {
      const current = monthlyMap.get(key)!;
      current.faturamento += s.totalValue;
      current.lucro += s.estimatedProfit;
      current.custo += s.totalValue - s.estimatedProfit;
      if (s.itemKey === 'gessoPoKg') {
        current.gessoSaidaTon += s.quantity / 1000;
      }
    }
  }

  for (const t of truckDeliveries) {
    const d = new Date(t.date || t.createdAt);
    const key = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
    if (monthlyMap.has(key)) {
      const current = monthlyMap.get(key)!;
      current.gessoEntradaTon += Number(t.tonsGessoPo) || 0;
    }
  }

  const monthlyFinancials = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    faturamento: Math.round(data.faturamento),
    lucro: Math.round(data.lucro),
    custo: Math.round(data.custo),
    gessoEntradaTon: Number(data.gessoEntradaTon.toFixed(1)),
    gessoSaidaTon: Number(data.gessoSaidaTon.toFixed(1)),
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'APROVADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-3 h-3" /> Aprovado</span>;
      case 'EM_EXECUCAO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200"><PlayCircle className="w-3 h-3" /> Em Obra</span>;
      case 'CONCLUIDO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Concluído</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO PRINCIPAL COM A LOGO OFICIAL */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm flex-shrink-0 bg-neutral-900">
              <Image
                src="/logo.jpg"
                alt="Logo O Ponto do Gesso"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-red/10 text-brand-red">
                  Painel Executivo
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal-dark tracking-tight mt-1">
                O Ponto do Gesso
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Gestão integrada de orçamentos paramétricos, balcão e pátio de estocagem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <Link
              href="/admin/orcamento"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Calculator className="w-4 h-4" /> Criar Orçamento
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 text-xs font-bold transition-all border border-neutral-200"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </form>
          </div>
        </header>

        {/* 4 CARDS DE MÉTRICAS RÁPIDAS (KPIs) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Faturamento Obras</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                {approvedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">{approvedQuotes.length} obras em andamento / fechadas</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Propostas Emitidas</span>
              <div className="p-2 rounded-xl bg-neutral-100 text-brand-charcoal-dark"><FileText className="w-4 h-4" /></div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-brand-charcoal-dark">
                {quotes.length}
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">Total em propostas: {totalQuotesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-sm space-y-3 transition-all ${isGessoLow ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-neutral-200/80'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Pátio de Gesso em Pó</span>
              {isGessoLow ? (
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700"><AlertTriangle className="w-4 h-4" /></div>
              ) : (
                <div className="p-2 rounded-xl bg-neutral-100 text-neutral-600"><Layers className="w-4 h-4" /></div>
              )}
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-brand-charcoal-dark">
                {tonsGesso} <span className="text-sm font-bold text-neutral-400">Ton</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">{isGessoLow ? 'Estoque crítico! Solicitar carreta.' : 'Nível seguro de armazenagem'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Vendas Balcão</span>
              <div className="p-2 rounded-xl bg-rose-50 text-brand-red"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-brand-red">
                {counterSalesRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">{recentSales.length} retiradas avulsas registradas</p>
            </div>
          </div>
        </section>

        {/* SEÇÃO PRINCIPAL: GRÁFICO À ESQUERDA + ATALHOS INTELIGENTES À DIREITA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Coluna 1 & 2: Gráficos de Tendência */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts monthlyFinancials={monthlyFinancials} />
          </div>

          {/* Coluna 3: Navegação Rápida com Micro-status */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Acesso aos Módulos Operacionais
            </h3>

            <Link
              href="/admin/orcamento"
              className="group bg-brand-charcoal-dark hover:bg-neutral-800 p-5 rounded-2xl text-white shadow-sm transition-all flex items-center justify-between border border-neutral-800"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-white/10 text-white">
                  <Calculator className="w-5 h-5 text-brand-red-light" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Novo Orçamento</h4>
                  <p className="text-[11px] text-neutral-400">Cálculo técnico e PDF</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/admin/historico"
              className="group bg-white hover:border-brand-red p-5 rounded-2xl border border-neutral-200/80 shadow-sm transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-neutral-100 text-brand-charcoal-dark">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-charcoal-dark">Histórico de Obras</h4>
                  <p className="text-[11px] text-neutral-400">{approvedQuotes.length} ativas no momento</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-red transition-colors" />
            </Link>

            <Link
              href="/admin/estoque"
              className="group bg-white hover:border-brand-red p-5 rounded-2xl border border-neutral-200/80 shadow-sm transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-neutral-100 text-brand-charcoal-dark">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-charcoal-dark">Estoque & Cargas</h4>
                  <p className="text-[11px] text-neutral-400">{totalPlacas} placas em saldo</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-red transition-colors" />
            </Link>

            <Link
              href="/admin/precos"
              className="group bg-white hover:border-brand-red p-5 rounded-2xl border border-neutral-200/80 shadow-sm transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-neutral-100 text-brand-charcoal-dark">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-charcoal-dark">Tabela de Preços</h4>
                  <p className="text-[11px] text-neutral-400">Custos e diárias parceiras</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-red transition-colors" />
            </Link>
          </div>
        </div>

        {/* TABELA DE PROPOSTAS RECENTES COM BADGES */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-brand-charcoal-dark">Propostas Mais Recentes</h2>
              <p className="text-xs text-neutral-400">Últimos clientes atendidos no balcão ou via WhatsApp.</p>
            </div>
            <Link
              href="/admin/historico"
              className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1"
            >
              Ver todas as propostas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Cliente</th>
                  <th className="py-3 px-2">Metragem</th>
                  <th className="py-3 px-2">Valor Fechado</th>
                  <th className="py-3 px-2 text-right">Status Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {quotes.slice(0, 6).map((q) => (
                  <tr key={q.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-2">
                      <span className="font-bold text-brand-charcoal-dark text-sm block">
                        {q.clientName}
                      </span>
                      {q.clientPhone && (
                        <span className="text-[11px] text-neutral-400">{q.clientPhone}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-neutral-600 font-semibold text-xs">
                      {q.totalAreaM2.toFixed(2)} m²
                    </td>
                    <td className="py-3.5 px-2 font-black text-brand-red text-sm">
                      {getEffectivePrice(q).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {getStatusBadge(q.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}