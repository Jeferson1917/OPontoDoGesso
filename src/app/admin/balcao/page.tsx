// src/app/admin/balcao/page.tsx
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { ArrowLeft, ShoppingBag, Search, DollarSign, Calendar, TrendingUp, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCounterSalesHistoryPage() {
  const sales = await prisma.counterSale.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalValueAll = sales.reduce((acc, s) => acc + s.totalValue, 0);
  const totalProfitAll = sales.reduce((acc, s) => acc + s.estimatedProfit, 0);

  const getItemLabel = (key: string) => {
    switch (key) {
      case 'gessoPoKg':
        return 'Gesso em Pó (kg)';
      case 'placaGesso60x60':
        return 'Placa de Gesso 60x60';
      case 'gessoColaKg':
        return 'Gesso Cola (kg)';
      case 'arameGalvanizadoKg':
        return 'Arame Galvanizado (kg)';
      case 'sisalKg':
        return 'Sisal / Juta (kg)';
      default:
        return key;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-red transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-brand-red">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal-dark tracking-tight">
                Histórico de Vendas no Balcão
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mt-1">
              Registro contínuo de insumos retirados no galpão com controle de faturamento e lucro estimado.
            </p>
          </div>

          <Link
            href="/admin/estoque"
            className="inline-flex items-center gap-2 bg-brand-charcoal-dark hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm self-start sm:self-center"
          >
            <Package className="w-4 h-4" /> Ir para Controle de Estoque
          </Link>
        </header>

        {/* CARDS RESUMO DO BALCÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase">Faturamento Total Balcão</span>
            <p className="text-2xl font-black text-brand-red">
              {totalValueAll.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[11px] text-neutral-500">{sales.length} vendas avulsas concluídas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase">Lucro Líquido Estimado</span>
            <p className="text-2xl font-black text-emerald-600">
              {totalProfitAll.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[11px] text-neutral-500">
              Margem média: {((totalProfitAll / (totalValueAll || 1)) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase">Ticket Médio</span>
            <p className="text-2xl font-black text-brand-charcoal-dark">
              {(totalValueAll / (sales.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[11px] text-neutral-500">Por retirada no galpão</p>
          </div>
        </div>

        {/* TABELA DE REGISTROS DE BALCÃO */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-brand-charcoal-dark">Todas as Saídas de Balcão</h2>
              <p className="text-xs text-neutral-400">Listagem ordenada das mais recentes para as mais antigas.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-neutral-100 rounded-full text-neutral-600">
              {sales.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Data / Hora</th>
                  <th className="py-3 px-2">Cliente / Gesseiro</th>
                  <th className="py-3 px-2">Item Retirado</th>
                  <th className="py-3 px-2">Quantidade</th>
                  <th className="py-3 px-2">Preço Unitário</th>
                  <th className="py-3 px-2">Valor Total</th>
                  <th className="py-3 px-2 text-right">Lucro Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-2 text-neutral-500 font-medium whitespace-nowrap">
                      {new Date(sale.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-brand-charcoal-dark">
                      {sale.customerName || 'Cliente Balcão'}
                    </td>
                    <td className="py-3.5 px-2 text-neutral-700 font-semibold">
                      {getItemLabel(sale.itemKey)}
                    </td>
                    <td className="py-3.5 px-2 font-black text-brand-charcoal-dark">
                      {sale.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-neutral-500">
                      {sale.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3.5 px-2 font-black text-brand-red">
                      {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3.5 px-2 text-right font-black text-emerald-600">
                      +{sale.estimatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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