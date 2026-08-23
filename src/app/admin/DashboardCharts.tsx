"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, HardHat, Layers } from "lucide-react";

export interface MonthlyData {
  month: string;
  faturamento: number;
  lucro: number;
  custo: number;
  gessoEntradaTon: number;
  gessoSaidaTon: number;
  faturamentoBalcao: number;
  lucroBalcao: number;
  faturamentoObras: number;
  lucroObras: number;
  gessoObrasTon: number;
  gessoBalcaoTon: number;
}

interface DashboardChartsProps {
  monthlyFinancials: MonthlyData[];
}

export default function DashboardCharts({ monthlyFinancials }: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<"consolidado" | "balcao" | "obras" | "material">("consolidado");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currencyFormatter = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 space-y-6">
      {/* Header com Navegação em 4 Visões */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <h2 className="text-base font-black text-brand-charcoal-dark flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-red" />
            Métricas e Desempenho Operacional
          </h2>
          <p className="text-xs text-neutral-400">
            Análise segmentada por vendas avulsas de balcão e execução de obras.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("consolidado")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "consolidado"
                ? "bg-white text-brand-charcoal-dark shadow-sm"
                : "text-neutral-500 hover:text-brand-charcoal-dark"
            }`}
          >
            Consolidado Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("balcao")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "balcao"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-neutral-500 hover:text-brand-charcoal-dark"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Vendas Balcão
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("obras")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "obras"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-neutral-500 hover:text-brand-charcoal-dark"
            }`}
          >
            <HardHat className="w-3.5 h-3.5" /> Uso em Obras
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("material")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "material"
                ? "bg-white text-brand-charcoal-dark shadow-sm"
                : "text-neutral-500 hover:text-brand-charcoal-dark"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Fluxo de Gesso
          </button>
        </div>
      </div>

      {!isMounted ? (
        <div className="h-72 w-full flex items-center justify-center text-xs font-bold text-neutral-400 animate-pulse">
          Renderizando métricas...
        </div>
      ) : (
        <>
          {/* 1. VISÃO CONSOLIDADA */}
          {activeTab === "consolidado" && (
            <div className="space-y-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={currencyFormatter} />
                    <Tooltip
                      formatter={(val: any) => [currencyFormatter(Number(val)), ""]}
                      contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
                    <Area isAnimationActive={false} type="monotone" dataKey="faturamento" name="Faturamento Total (Bruto)" stroke="#18181b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFaturamento)" />
                    <Area isAnimationActive={false} type="monotone" dataKey="lucro" name="Lucro Total (Líquido)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLucro)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80">
                  <span className="text-neutral-400 block font-bold">Faturamento Médio Mensal</span>
                  <span className="text-sm font-black text-brand-charcoal-dark">
                    {currencyFormatter(monthlyFinancials.reduce((a, b) => a + b.faturamento, 0) / (monthlyFinancials.length || 1))}
                  </span>
                </div>
                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                  <span className="text-emerald-700 block font-bold">Lucro Líquido Acumulado</span>
                  <span className="text-sm font-black text-emerald-800">
                    {currencyFormatter(monthlyFinancials.reduce((a, b) => a + b.lucro, 0))}
                  </span>
                </div>
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80">
                  <span className="text-neutral-400 block font-bold">Custo Total de Insumos</span>
                  <span className="text-sm font-black text-neutral-700">
                    {currencyFormatter(monthlyFinancials.reduce((a, b) => a + b.custo, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. VISÃO BALCÃO */}
          {activeTab === "balcao" && (
            <div className="space-y-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={currencyFormatter} />
                    <Tooltip
                      formatter={(val: any) => [currencyFormatter(Number(val)), ""]}
                      contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
                    <Bar isAnimationActive={false} dataKey="faturamentoBalcao" name="Venda Balcão (Total Entrado)" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar isAnimationActive={false} dataKey="lucroBalcao" name="Margem Balcão (Lucro Líquido)" fill="#059669" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
                  <span className="text-blue-700 block font-bold">Total Arrecadado no Balcão (Bruto)</span>
                  <span className="text-base font-black text-blue-950">
                    {currencyFormatter(monthlyFinancials.reduce((a, b) => a + b.faturamentoBalcao, 0))}
                  </span>
                  <p className="text-[10px] text-blue-500 mt-0.5">Soma de todas as entradas de caixa</p>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-emerald-700 block font-bold">Lucro Líquido do Balcão (Margem)</span>
                  <span className="text-base font-black text-emerald-950">
                    {currencyFormatter(monthlyFinancials.reduce((a, b) => a + b.lucroBalcao, 0))}
                  </span>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Dinheiro livre após abater o custo do gesso</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. VISÃO USO EM OBRAS */}
          {activeTab === "obras" && (
            <div className="space-y-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorObras" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={currencyFormatter} />
                    <Tooltip
                      formatter={(val: any) => [currencyFormatter(Number(val)), ""]}
                      contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
                    <Area isAnimationActive={false} type="monotone" dataKey="faturamentoObras" name="Faturamento Obras" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorObras)" />
                    <Area isAnimationActive={false} type="monotone" dataKey="lucroObras" name="Lucro das Obras" stroke="#047857" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-emerald-700 block font-bold">Faturamento Total em Contratos</span>
                  <span className="text-base font-black text-emerald-900">
                    {currencyFormatter(monthlyFinancials.reduce((a, b) => a + b.faturamentoObras, 0))}
                  </span>
                </div>
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                  <span className="text-neutral-500 block font-bold">Consumo de Gesso em Canteiro</span>
                  <span className="text-base font-black text-brand-charcoal-dark">
                    {monthlyFinancials.reduce((a, b) => a + b.gessoObrasTon, 0).toFixed(1)} Toneladas
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. VISÃO FLUXO DE MATERIAL */}
          {activeTab === "material" && (
            <div className="space-y-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={(val) => `${val} T`} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Toneladas`, ""]}
                      contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
                    <Bar isAnimationActive={false} dataKey="gessoEntradaTon" name="Entrada Caminhão (Compra)" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={16} />
                    <Bar isAnimationActive={false} dataKey="gessoObrasTon" name="Consumo em Obras" fill="#10b981" radius={[6, 6, 0, 0]} barSize={16} />
                    <Bar isAnimationActive={false} dataKey="gessoBalcaoTon" name="Saída no Balcão" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}