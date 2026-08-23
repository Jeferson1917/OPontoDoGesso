'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MonthlyData } from './DashboardCharts';
import { TrendingUp } from 'lucide-react';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 h-80 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
      <span className="text-xs font-bold text-neutral-400">Carregando métricas do painel...</span>
    </div>
  ),
});

export default function ChartsWrapper({ monthlyFinancials }: { monthlyFinancials: MonthlyData[] }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Adia a inicialização dos gráficos pesados para quando o navegador estiver ocioso
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => setShouldRender(true));
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timeout = setTimeout(() => setShouldRender(true), 150);
      return () => clearTimeout(timeout);
    }
  }, []);

  if (!shouldRender) {
    return (
      <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 h-80 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 animate-pulse">
          <TrendingUp className="w-4 h-4 text-brand-red" />
          <span>Sincronizando painel executivo...</span>
        </div>
      </div>
    );
  }

  return <DashboardCharts monthlyFinancials={monthlyFinancials} />;
}