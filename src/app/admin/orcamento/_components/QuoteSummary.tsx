import { AlertTriangle, BookmarkCheck, Download } from 'lucide-react';
import type { ProjectQuote } from '../../../data/calculatorTypes';

interface QuoteSummaryProps {
  quoteResult: ProjectQuote;
  effectivePrice: number;
  isCustomPriceActive: boolean;
  customFinalPrice: number | null;
  onToggleCustomPrice: (active: boolean) => void;
  onCustomPriceChange: (value: number) => void;
  onSave: () => void;
  onDownloadPdf: () => void;
}

export function QuoteSummary({
  quoteResult,
  effectivePrice,
  isCustomPriceActive,
  customFinalPrice,
  onToggleCustomPrice,
  onCustomPriceChange,
  onSave,
  onDownloadPdf,
}: QuoteSummaryProps) {
  const baseCostIrreducible = (quoteResult.totalMaterialCost || 0) + (quoteResult.totalLaborCost || 0);
  const discountValue = quoteResult.suggestedFinalPrice - effectivePrice;
  const isBelowCost = effectivePrice < baseCostIrreducible;
  const estimatedProfitMargin = effectivePrice - baseCostIrreducible;

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 space-y-6">
      <div className="border-b border-neutral-100 pb-3">
        <h2 className="text-base font-bold text-brand-charcoal-dark">
          Fechamento da Proposta
        </h2>
        <p className="text-xs text-neutral-600">
          Sugestão paramétrica versus valor acordado no balcão.
        </p>
      </div>

      {/* Resumo de Custos Diretos */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-neutral-700">
          <span>Custo Estimado Insumos:</span>
          <span className="font-bold">
            {quoteResult.totalMaterialCost.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        <div className="flex justify-between text-neutral-700">
          <span>Mão de Obra Parceira:</span>
          <span className="font-bold">
            {quoteResult.totalLaborCost.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        <div className="flex justify-between text-neutral-900 font-black border-t border-neutral-100 pt-2">
          <span>Custo Base Mínimo:</span>
          <span>
            {baseCostIrreducible.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
      </div>

      {/* Sugestão vs Negociado */}
      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-700">
            Sugestão de Tabela:
          </span>
          <span className="text-sm font-bold text-neutral-900">
            {quoteResult.suggestedFinalPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        {/* Toggle de Negociação */}
        <div className="pt-2 border-t border-neutral-200 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="toggle-custom-price" className="text-xs font-bold text-brand-charcoal-dark flex items-center gap-1.5 cursor-pointer">
              <input
                id="toggle-custom-price"
                type="checkbox"
                checked={isCustomPriceActive}
                onChange={(e) => onToggleCustomPrice(e.target.checked)}
                className="w-4 h-4 rounded text-brand-red focus:ring-brand-red"
              />
              Ajustar Valor Negociado
            </label>
            {isCustomPriceActive && (
              <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Manual
              </span>
            )}
          </div>

          {isCustomPriceActive && (
            <div className="space-y-2 pt-1">
              <div className="relative">
                <label htmlFor="custom-final-price-input" className="sr-only">
                  Valor Final Negociado em Reais
                </label>
                <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-500">
                  R$
                </span>
                <input
                  id="custom-final-price-input"
                  type="number"
                  step="10"
                  value={customFinalPrice ?? ""}
                  onChange={(e) => onCustomPriceChange(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-red bg-white text-neutral-900"
                />
              </div>

              {discountValue > 0 && (
                <p className="text-[11px] text-emerald-800 font-bold">
                  Desconto concedido: R$ {discountValue.toFixed(2)} (-
                  {((discountValue / quoteResult.suggestedFinalPrice) * 100).toFixed(1)}%)
                </p>
              )}
              {discountValue < 0 && (
                <p className="text-[11px] text-blue-800 font-bold">
                  Acréscimo aplicado: + R$ {Math.abs(discountValue).toFixed(2)} (+
                  {((Math.abs(discountValue) / quoteResult.suggestedFinalPrice) * 100).toFixed(1)}%)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Risco ou Margem Positiva */}
      {isBelowCost ? (
        <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-xl text-rose-950 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-black text-rose-700">
            <AlertTriangle className="w-4 h-4" /> Valor Abaixo do Custo Mínimo!
          </div>
          <p className="text-[11px] leading-relaxed">
            O valor acordado (R$ {effectivePrice.toFixed(2)}) não cobre os insumos e a mão de obra (R$ {baseCostIrreducible.toFixed(2)}). Prejuízo estimado de R$ {Math.abs(estimatedProfitMargin).toFixed(2)}.
          </p>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-emerald-800 font-bold block">
              Margem Líquida Estimada:
            </span>
            <span className="text-[11px] text-emerald-700">
              Após pagar mão de obra e insumos
            </span>
          </div>
          <span className="text-base font-black text-emerald-900">
            + {estimatedProfitMargin.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
      )}

      {/* Valor Final Destacado */}
      <div className="bg-brand-charcoal-dark text-white p-4 rounded-xl text-center space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-semibold">
          Valor Final da Proposta
        </span>
        <span className="text-2xl sm:text-3xl font-black text-brand-red-light">
          {effectivePrice.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-2"
        >
          <BookmarkCheck className="w-4 h-4" /> Salvar Orçamento no Sistema
        </button>

        <button
          type="button"
          onClick={onDownloadPdf}
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-brand-charcoal-dark font-bold py-3 rounded-xl transition-all border border-neutral-200 text-xs flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4 text-brand-red" /> Baixar PDF com Valor Acordado
        </button>
      </div>
    </section>
  );
}
