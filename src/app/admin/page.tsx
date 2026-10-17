// src/app/admin/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '../../lib/prisma';
import { requireAdminPage } from '../../lib/auth';
import { logoutAdmin } from '../actions/authActions';
import ChartsWrapper from './ChartsWrapper';
import { APPROVED_STATUSES, buildMonthlyFinancials, dashboardStartDate, getEffectivePrice, isApproved } from '../utils/dashboardMetrics';
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
  PlayCircle,
  ShoppingBag,
  Wallet
} from 'lucide-react';
import { formatBusinessDate } from '../utils/dates';
import { receivedThisMonth, totalReceivable } from '../utils/payments';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const since = dashboardStartDate();

  // Totais dos cards usam o histórico todo, mas só com os campos necessários;
  // linhas completas (snapshot, vendas, cargas) só da janela dos gráficos
  const [quotes, chartQuotes, stockBalances, salesTotals, chartSales, truckDeliveries, recentPayments] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, clientName: true, clientPhone: true, totalAreaM2: true, status: true, suggestedFinalPrice: true, finalAgreedPrice: true, payments: { select: { amount: true } } },
    }),
    prisma.quote.findMany({
      where: {
        status: { in: [...APPROVED_STATUSES] },
        OR: [{ approvedAt: { gte: since } }, { approvedAt: null, createdAt: { gte: since } }],
      },
      select: { status: true, createdAt: true, approvedAt: true, totalAreaM2: true, suggestedFinalPrice: true, finalAgreedPrice: true, roomsData: true, materialsSnapshot: true, stockMovement: true },
    }),
    prisma.stockBalance.findMany(),
    prisma.counterSale.aggregate({ _sum: { totalValue: true }, _count: true }),
    prisma.counterSale.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, itemKey: true, quantity: true, totalValue: true, estimatedProfit: true },
    }),
    prisma.truckDelivery.findMany({ where: { date: { gte: since } }, select: { date: true, tonsGessoPo: true } }),
    prisma.payment.findMany({ where: { paidAt: { gte: since } }, select: { amount: true, paidAt: true } }),
  ]);

  // Propostas em aberto ou fechadas; canceladas não entram no valor
  const activeQuotes = quotes.filter((q) => q.status !== 'CANCELADO');
  const totalQuotesValue = activeQuotes.reduce((acc, q) => acc + getEffectivePrice(q), 0);
  const cancelledCount = quotes.length - activeQuotes.length;
  const approvedQuotes = quotes.filter((q) => isApproved(q.status));
  const approvedRevenue = approvedQuotes.reduce((acc, q) => acc + getEffectivePrice(q), 0);
  const counterSalesRevenue = salesTotals._sum.totalValue ?? 0;
  const counterSalesCount = salesTotals._count;

  const gessoItem = stockBalances.find((s) => s.itemKey === 'gessoPoKg');
  const placaItem = stockBalances.find((s) => s.itemKey === 'placaGesso60x60');
  
  const tonsGesso = gessoItem ? (gessoItem.currentQuantity / 1000).toFixed(1) : '0';
  const totalPlacas = placaItem ? placaItem.currentQuantity : 0;
  const isGessoLow = gessoItem ? gessoItem.currentQuantity <= gessoItem.minThreshold : false;
  const lowStockItems = stockBalances.filter((s) => s.currentQuantity <= s.minThreshold);

  const receivedMonth = receivedThisMonth(recentPayments);
  const receivable = totalReceivable(quotes.map((q) => ({ status: q.status, price: getEffectivePrice(q), payments: q.payments })));

  const monthlyFinancials = buildMonthlyFinancials(chartQuotes, chartSales, truckDeliveries);

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
    <main className="min-h-screen bg-[#f8f9fa] text-neutral-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm flex-shrink-0 bg-neutral-900">
              <Image
                src="/logo.jpg"
                alt="Logo O Ponto do Gesso"
                fill
                sizes="80px"
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
                  {formatBusinessDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
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

        {/* ALERTA DE ESTOQUE BAIXO (todos os itens) */}
        {lowStockItems.length > 0 && (
          <Link
            href="/admin/estoque"
            className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-2xl hover:bg-amber-100/70 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Estoque abaixo do ponto de reposição</p>
              <p className="text-xs mt-0.5">
                {lowStockItems
                  .map((item) => `${item.name}: ${item.currentQuantity.toLocaleString('pt-BR')} ${item.unit} (mínimo ${item.minThreshold.toLocaleString('pt-BR')})`)
                  .join(' · ')}
              </p>
            </div>
          </Link>
        )}

        {/* 4 CARDS DE KPIS */}
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
                {activeQuotes.length}
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Total: {totalQuotesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                {cancelledCount > 0 && ` · ${cancelledCount} cancelada${cancelledCount > 1 ? 's' : ''} fora da conta`}
              </p>
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
              <p className="text-xs text-neutral-500 mt-1 font-medium">{counterSalesCount} retiradas avulsas</p>
            </div>
          </div>
        </section>

        {/* RECEBIMENTOS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Recebido este mês</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {receivedMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">Pagamentos lançados nas obras</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Wallet className="w-5 h-5" /></div>
          </div>
          <Link
            href="/admin/historico"
            className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between hover:border-brand-red transition-colors"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">A receber</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {receivable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">Obras aprovadas, em execução ou concluídas ainda não quitadas</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          </Link>
        </section>

        {/* SEÇÃO PRINCIPAL: GRÁFICO DIFERIDO + NAVEGAÇÃO RÁPIDA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <ChartsWrapper monthlyFinancials={monthlyFinancials} />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Acesso aos Módulos Operacionais
            </h3>

            <Link
              href="/admin/balcao"
              className="group bg-rose-500/10 hover:bg-rose-500/15 p-5 rounded-2xl border border-rose-200 shadow-sm transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-brand-red text-white shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-charcoal-dark">Histórico do Balcão</h4>
                  <p className="text-[11px] text-neutral-500">{counterSalesCount} saídas avulsas</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-brand-red transition-colors" />
            </Link>

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

        {/* TABELA DE PROPOSTAS RECENTES */}
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
    </main>
  );
}