'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { defaultPricingConfig } from '../../data/pricingConfig';
import { ArrowLeft, Save, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function AdminPricingPage() {
  const [config, setConfig] = useState(defaultPricingConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Carrega configurações salvas no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('opontodogesso_pricing_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
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
    setSavedSuccess(false);
  };

  const handleMaterialChange = (key: keyof typeof defaultPricingConfig.materialCosts, value: number) => {
    setConfig((prev) => ({
      ...prev,
      materialCosts: { ...prev.materialCosts, [key]: value },
    }));
    setSavedSuccess(false);
  };

  const handleGeneralChange = (key: 'minimumProjectPrice' | 'profitMarginMultiplier' | 'wasteFactor', value: number) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    localStorage.setItem('opontodogesso_pricing_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar todos os valores para o padrão original de fábrica?')) {
      setConfig(defaultPricingConfig);
      localStorage.removeItem('opontodogesso_pricing_config');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Topo / Navegação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="space-y-1">
            <Link
              href="/admin/orcamento"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-red transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Orçamentista
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-dark">
              Tabela de Preços & Coeficientes
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Ajuste os valores unitários de mão de obra e insumos de gesso tradicional.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Restaurar Padrão
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold transition-all shadow-sm"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Valores atualizados e salvos com sucesso! O orçamentista já está usando os novos preços.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mão de Obra */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
            <h2 className="text-base font-bold text-brand-charcoal-dark border-b border-neutral-100 pb-3">
              Mão de Obra (Execução)
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Forro Plaquinha 60x60 (R$ / m²)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.laborRates.FORRO_PLAQUINHA_60X60}
                  onChange={(e) => handleLaborChange('FORRO_PLAQUINHA_60X60', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Revestimento Gesso Liso em Parede (R$ / m²)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.laborRates.REVESTIMENTO_GESSO_LISO}
                  onChange={(e) => handleLaborChange('REVESTIMENTO_GESSO_LISO', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Sanca Aberta (R$ / metro linear)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.laborRates.SANCA_ABERTA_GESSO}
                  onChange={(e) => handleLaborChange('SANCA_ABERTA_GESSO', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Sanca Fechada (R$ / metro linear)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.laborRates.SANCA_FECHADA_GESSO}
                  onChange={(e) => handleLaborChange('SANCA_FECHADA_GESSO', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Moldura / Roda-topo (R$ / metro linear)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.laborRates.MOLDURA_RODATOPO}
                  onChange={(e) => handleLaborChange('MOLDURA_RODATOPO', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Cortineiro (R$ / metro linear)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.laborRates.CORTINEIRO_GESSO}
                  onChange={(e) => handleLaborChange('CORTINEIRO_GESSO', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>
            </div>
          </div>

          {/* Custo de Materiais & Insumos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
            <h2 className="text-base font-bold text-brand-charcoal-dark border-b border-neutral-100 pb-3">
              Custo dos Materiais (Compra)
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Placa de Gesso 60x60cm (R$ / unidade)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.materialCosts.placaGesso60x60}
                  onChange={(e) => handleMaterialChange('placaGesso60x60', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Saco de Gesso em Pó 20kg (R$ / saco)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.materialCosts.gessoPo20kg}
                  onChange={(e) => handleMaterialChange('gessoPo20kg', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Gesso Cola (R$ / kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.materialCosts.gessoColaKg}
                  onChange={(e) => handleMaterialChange('gessoColaKg', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Arame Galvanizado nº 18 (R$ / kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.materialCosts.arameGalvanizado18Kg}
                  onChange={(e) => handleMaterialChange('arameGalvanizado18Kg', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Sisal / Juta (R$ / kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.materialCosts.sisalJutaKg}
                  onChange={(e) => handleMaterialChange('sisalJutaKg', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Custo Unitário da Moldura Fabricada (R$ / metro linear)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.materialCosts.metroMolduraFabricada}
                  onChange={(e) => handleMaterialChange('metroMolduraFabricada', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
              </div>
            </div>
          </div>

          {/* Regras Comerciais e Margem */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
            <h2 className="text-base font-bold text-brand-charcoal-dark border-b border-neutral-100 pb-3">
              Regras Comerciais & Margem Operacional
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Taxa Mínima de Saída / Obra Pequena (R$)
                </label>
                <input
                  type="number"
                  step="10"
                  value={config.minimumProjectPrice}
                  onChange={(e) => handleGeneralChange('minimumProjectPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">Nenhum orçamento sairá abaixo desse valor.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Multiplicador de Margem Líquida
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={config.profitMarginMultiplier}
                  onChange={(e) => handleGeneralChange('profitMarginMultiplier', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">Ex: 1.35 representa 35% de margem.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Fator de Perda / Quebra de Placas
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.wasteFactor}
                  onChange={(e) => handleGeneralChange('wasteFactor', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">Ex: 1.10 adiciona 10% de placas extras para corte.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}