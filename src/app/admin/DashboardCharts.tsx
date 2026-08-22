// src/app/admin/DashboardCharts.tsx
"use client";

import { useState } from "react";
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
import { TrendingUp, BarChart3, ArrowUpRight } from "lucide-react";

interface MonthlyData {
  month: string;
  faturamento: number;
  lucro: number;
  custo: number;
  gessoEntradaTon: number;
  gessoSaidaTon: number;
}

interface DashboardChartsProps {
  monthlyFinancials: MonthlyData[];
}

export default function DashboardCharts({ monthlyFinancials }: DashboardChartsProps) {
  const [chartView, setChartView] = useState<"financeiro" | "material">("financeiro");

  // Formatação de Moeda
  const currencyFormatter = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
      {/* Cabeçalho dos Gráficos com Alternador de Visão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-brand-charcoal-dark flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-red" />
            Desempenho & Tendências do Galpão
          </h2>
          <p className="text-xs text-neutral-400">
            Acompanhamento mensal de receita, lucro real e fluxo físico de gesso.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setChartView("financeiro")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              chartView === "financeiro"
                ? "bg-white text-brand-charcoal-dark shadow-sm"
                : "text-neutral-500 hover:text-brand-charcoal-dark"
            }`}
          >
            Faturamento & Lucro
          </button>
          <button
            type="button"
            onClick={() => setChartView("material")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              chartView === "material"
                ? "bg-white text-brand-charcoal-dark shadow-sm"
                : "text-neutral-500 hover:text-brand-charcoal-dark"
            }`}
          >
            Fluxo de Gesso (Ton)
          </button>
        </div>
      </div>

      {/* Gráfico 1: Financeiro (Área com Gradiente) */}
      {chartView === "financeiro" && (
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyFinancials}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
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
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  tickFormatter={currencyFormatter}
                />
                <Tooltip
                  formatter={(val: any) => [currencyFormatter(Number(val)), ""]}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  name="Faturamento Total"
                  stroke="#18181b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorFaturamento)"
                />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  name="Lucro Líquido Estimado"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLucro)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <span className="text-neutral-400 block font-semibold">Média Mensal Faturada</span>
              <span className="text-sm font-black text-brand-charcoal-dark">
                {currencyFormatter(
                  monthlyFinancials.reduce((a, b) => a + b.faturamento, 0) /
                    (monthlyFinancials.length || 1)
                )}
              </span>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block font-semibold">Margem Líquida Média</span>
              <span className="text-sm font-black text-emerald-800">
                {(
                  (monthlyFinancials.reduce((a, b) => a + b.lucro, 0) /
                    (monthlyFinancials.reduce((a, b) => a + b.faturamento, 0) || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <span className="text-neutral-400 block font-semibold">Custo Operacional Acumulado</span>
              <span className="text-sm font-black text-neutral-700">
                {currencyFormatter(monthlyFinancials.reduce((a, b) => a + b.custo, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico 2: Fluxo de Gesso em Toneladas (Barras Comparativas) */}
      {chartView === "material" && (
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyFinancials}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  tickFormatter={(val) => `${val} T`}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} Toneladas`, ""]}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                />
                <Bar
                  dataKey="gessoEntradaTon"
                  name="Entrada Caminhão"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="gessoSaidaTon"
                  name="Saída Obras / Balcão"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-blue-900 block">Balanço Físico de Gesso</span>
              <span className="text-blue-700 text-[11px]">
                Comparação entre carretas descarregadas e o consumo registrado nas obras e vendas.
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-blue-700 block">Giro Médio</span>
              <span className="text-sm font-black text-blue-950">
                {(
                  monthlyFinancials.reduce((a, b) => a + b.gessoSaidaTon, 0) /
                  (monthlyFinancials.length || 1)
                ).toFixed(1)}{" "}
                T/mês
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}