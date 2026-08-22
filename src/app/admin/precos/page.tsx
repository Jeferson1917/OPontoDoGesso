'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { defaultPricingConfig } from '../../data/pricingConfig';
import {
  ArrowLeft,
  Settings,
  Save,
  RotateCcw,
  Pickaxe,
  HardHat,
  TrendingUp,
  Info,
  Layers
} from 'lucide-react';

export default function AdminPricingPage() {
  const [config, setConfig] = useState(defaultPricingConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega configurações salvas no localStorage
  useEffect(() => {
    setIsLoaded(true);
    const saved = localStorage.getItem('opontodogesso_pricing_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({
          ...defaultPricingConfig,
          ...parsed,
          laborRates: { ...defaultPricingConfig.laborRates, ...(parsed.laborRates || {}) },
          materialCosts: { ...defaultPricingConfig.materialCosts, ...(parsed.materialCosts || {}) },
        });
      } catch (err) {
        console.error('Erro ao ler configurações salvas:', err);
      }
    }
  }, []);

  const handleLaborChange = (key: keyof typeof defaultPricingConfig.laborRates, value: number) => {
    setConfig((prev) => ({
      ...prev,
      laborRates: { ...prev.laborRates, [key]: value },
    }));
  };

  const handleMaterialChange = (key: keyof typeof defaultPricingConfig.materialCosts, value: number) => {
    setConfig((prev) => ({
      ...prev,
      materialCosts: { ...prev.materialCosts, [key]: value },
    }));
  };

  const handleGeneralChange = (
    key: 'minimumProjectPrice' | 'profitMarginMultiplier' | 'wasteFactor',
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('opontodogesso_pricing_config', JSON.stringify(config));
      toast.success('Tabela de preços e coeficientes atualizada com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar as configurações de preços.');
    }
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar todos os valores para o padrão original de fábrica?')) {
      setConfig(defaultPricingConfig);
      localStorage.removeItem('opontodogesso_pricing_config');
      toast.info('Valores originais restaurados com sucesso.');
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* CABEÇALHO SUPERIOR */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-red transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-neutral-100 text-brand-charcoal-dark">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal-dark tracking-tight">
                Tabela de Preços & Coeficientes
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mt-1">
              Ajuste as taxas de execução de mão de obra parceira, custo dos insumos e margens comerciais do motor orçamentário.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all border border-neutral-200"
            >
              <RotateCcw className="w-4 h-4" /> Restaurar Padrão
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold transition-all shadow-sm"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </header>

        {/* INFO BOX TÉCNICO */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex gap-3.5 text-blue-900">
          <Info className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-blue-950">Dinâmica de Cálculo Automático</p>
            <p className="text-blue-800 leading-relaxed">
              Ao alterar qualquer valor abaixo, todos os novos orçamentos calculados no sistema passarão a adotar imediatamente as novas taxas de diária parceira e custos unitários de placas e gesso em pó.
            </p>
          </div>
        </div>

        {/* GRID DE CONFIGURAÇÕES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: MÃO DE OBRA (EXECUÇÃO) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <HardHat className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-brand-charcoal-dark uppercase tracking-wider">
                  Mão de Obra Parceira
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-neutral-400">Repasse Diária</span>
            </div>

            <div className="space-y-3.5">
              {[
                { key: 'FORRO_PLAQUINHA_60X60', label: 'Forro Plaquinha 60x60', unit: 'R$ / m²' },
                { key: 'REVESTIMENTO_GESSO_LISO', label: 'Revestimento Gesso Liso', unit: 'R$ / m²' },
                { key: 'SANCA_ABERTA_GESSO', label: 'Sanca Aberta com Aba', unit: 'R$ / metro linear' },
                { key: 'SANCA_FECHADA_GESSO', label: 'Sanca Fechada Estruturada', unit: 'R$ / metro linear' },
                { key: 'MOLDURA_RODATOPO', label: 'Moldura / Roda-topo', unit: 'R$ / metro linear' },
                { key: 'CORTINEIRO_GESSO', label: 'Cortineiro de Gesso', unit: 'R$ / metro linear' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-neutral-50/80 transition-colors">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700">{item.label}</label>
                    <span className="text-[10px] text-neutral-400">{item.unit}</span>
                  </div>
                  <div className="relative w-32 flex-shrink-0">
                    <span className="absolute left-3 top-2 text-[11px] font-bold text-neutral-400">R$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={config.laborRates[item.key as keyof typeof defaultPricingConfig.laborRates]}
                      onChange={(e) => handleLaborChange(item.key as keyof typeof defaultPricingConfig.laborRates, Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-black text-neutral-800 focus:outline-none focus:border-brand-red bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: CUSTO DE MATERIAIS & INSUMOS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-brand-red">
                  <Pickaxe className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-brand-charcoal-dark uppercase tracking-wider">
                  Custo dos Insumos
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-neutral-400">Preço de Compra</span>
            </div>

            <div className="space-y-3.5">
              {[
                { key: 'placaGesso60x60', label: 'Placa de Gesso 60x60cm', unit: 'R$ / unidade' },
                { key: 'gessoPo20kg', label: 'Saco Gesso em Pó (20kg)', unit: 'R$ / saco' },
                { key: 'gessoColaKg', label: 'Gesso Cola', unit: 'R$ / kg' },
                { key: 'arameGalvanizado18Kg', label: 'Arame Galvanizado nº 18', unit: 'R$ / kg' },
                { key: 'sisalJutaKg', label: 'Sisal / Juta Natural', unit: 'R$ / kg' },
                { key: 'metroMolduraFabricada', label: 'Moldura Fabricada', unit: 'R$ / metro linear' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-neutral-50/80 transition-colors">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700">{item.label}</label>
                    <span className="text-[10px] text-neutral-400">{item.unit}</span>
                  </div>
                  <div className="relative w-32 flex-shrink-0">
                    <span className="absolute left-3 top-2 text-[11px] font-bold text-neutral-400">R$</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={config.materialCosts[item.key as keyof typeof defaultPricingConfig.materialCosts]}
                      onChange={(e) => handleMaterialChange(item.key as keyof typeof defaultPricingConfig.materialCosts, Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-black text-neutral-800 focus:outline-none focus:border-brand-red bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 3: REGRAS COMERCIAIS & MARGEM OPERACIONAL */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-brand-charcoal-dark uppercase tracking-wider">
                  Regras Comerciais & Margem Operacional
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-neutral-400">Equação Geral</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              
              <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
                <label className="block text-xs font-bold text-neutral-700">
                  Taxa Mínima por Obra
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-neutral-400">R$</span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={config.minimumProjectPrice}
                    onChange={(e) => handleGeneralChange('minimumProjectPrice', Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-sm font-black text-brand-charcoal-dark focus:outline-none focus:border-brand-red bg-white"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Valor piso de saída para serviços de pequena metragem.
                </span>
              </div>

              <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
                <label className="block text-xs font-bold text-neutral-700">
                  Multiplicador de Margem Líquida
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">x</span>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    value={config.profitMarginMultiplier}
                    onChange={(e) => handleGeneralChange('profitMarginMultiplier', Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-neutral-300 text-sm font-black text-emerald-700 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Ex: <strong>1.35</strong> aplica 35% de margem sobre custo de mão de obra e insumos.
                </span>
              </div>

              <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
                <label className="block text-xs font-bold text-neutral-700">
                  Fator de Quebra / Perda
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">x</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={config.wasteFactor}
                    onChange={(e) => handleGeneralChange('wasteFactor', Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-neutral-300 text-sm font-black text-rose-700 focus:outline-none focus:border-rose-600 bg-white"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Ex: <strong>1.10</strong> adiciona 10% de placas extras no cálculo de segurança.
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}