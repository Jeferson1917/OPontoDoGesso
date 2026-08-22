// src/app/admin/orcamento/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoomInput, RoomServiceItem } from "../../data/calculatorTypes";
import { defaultPricingConfig } from "../../data/pricingConfig";
import { generateProjectQuote } from "../../utils/quoteEngine";
import { logoutAdmin } from "../../actions/authActions";
import { generateQuotePDF } from "../../utils/pdfGenerator";
import { saveQuoteAction } from '../../actions/quoteActions';
import { toast } from 'sonner';
import { Download } from "lucide-react";
import { LogOut, Settings } from "lucide-react";
import { Trash2, Package, Plus, Calculator, FileText, CheckCircle2, BookmarkCheck, AlertTriangle } from "lucide-react";

const MAX_DIMENSION_METERS = 100;
const MAX_LINEAR_METERS = 500;

const formatPhoneValue = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const clampMetricValue = (value: number, max: number, fallback = 0) => {
  if (!Number.isFinite(value)) return fallback;
  const normalized = Math.min(Math.max(value, 0), max);
  return Number(normalized.toFixed(2));
};

export default function AdminBudgetPage() {
  const [rooms, setRooms] = useState<RoomInput[]>([
    {
      id: "1",
      name: "Sala de Estar",
      lengthMeters: 5,
      widthMeters: 4,
      services: [{ type: "FORRO_PLAQUINHA_60X60", comTabicaOuNegativo: false }],
    },
  ]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [pricingConfig, setPricingConfig] = useState(defaultPricingConfig);
  const [customFinalPrice, setCustomFinalPrice] = useState<number | null>(null);
  const [isCustomPriceActive, setIsCustomPriceActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("opontodogesso_pricing_config");

    if (!saved) return;

    try {
      const parsedConfig = JSON.parse(saved);

      setPricingConfig({
        ...defaultPricingConfig,
        ...parsedConfig,
        laborRates: {
          ...defaultPricingConfig.laborRates,
          ...(parsedConfig?.laborRates ?? {}),
        },
        materialCosts: {
          ...defaultPricingConfig.materialCosts,
          ...(parsedConfig?.materialCosts ?? {}),
        },
      });
    } catch (err) {
      console.error("Erro ao ler preços personalizados:", err);
    }
  }, []);

  // Adicionar novo cômodo
  const handleAddRoom = () => {
    const newRoom: RoomInput = {
      id: Date.now().toString(),
      name: `Cômodo ${rooms.length + 1}`,
      lengthMeters: 3,
      widthMeters: 3,
      services: [{ type: "FORRO_PLAQUINHA_60X60", comTabicaOuNegativo: false }],
    };
    setRooms([...rooms, newRoom]);
  };

  // Remover cômodo
  const handleRemoveRoom = (id: string) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  // Atualizar dados básicos do cômodo
  const handleRoomChange = (
    id: string,
    field: keyof RoomInput,
    value: string | number,
  ) => {
    setRooms(
      rooms.map((room) => {
        if (room.id !== id) return room;

        if (
          field === "lengthMeters" ||
          field === "widthMeters" ||
          field === "wallHeightMeters"
        ) {
          const numericValue = Number(value);
          return {
            ...room,
            [field]: clampMetricValue(numericValue, MAX_DIMENSION_METERS, 0),
          };
        }

        return { ...room, [field]: value };
      }),
    );
  };

  // Adicionar serviço a um cômodo
  const handleAddService = (roomId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const newService: RoomServiceItem = {
            type: "MOLDURA_RODATOPO",
            comTabicaOuNegativo: false,
            customLinearMeters: 10,
          };
          return {
            ...room,
            services: [...room.services, newService],
          };
        }
        return room;
      }),
    );
  };

  // Remover serviço de um cômodo
  const handleRemoveService = (roomId: string, serviceIndex: number) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const updatedServices = room.services.filter(
            (_, idx) => idx !== serviceIndex,
          );
          return { ...room, services: updatedServices };
        }
        return room;
      }),
    );
  };

  // Atualizar tipo ou dados do serviço
  const handleServiceChange = (
    roomId: string,
    serviceIndex: number,
    field: keyof RoomServiceItem,
    value: any,
  ) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const updatedServices = room.services.map((srv, idx) => {
            if (idx !== serviceIndex) return srv;

            const nextValue =
              field === "customLinearMeters"
                ? clampMetricValue(Number(value), MAX_LINEAR_METERS, 0)
                : value;

            return { ...srv, [field]: nextValue };
          });
          return { ...room, services: updatedServices };
        }
        return room;
      }),
    );
  };

  // Executar motor de cálculo
  const quoteResult = generateProjectQuote(rooms, pricingConfig);

  // Cálculos de negociação e margem
  const baseCostIrreducible = (quoteResult.totalMaterialCost || 0) + (quoteResult.totalLaborCost || 0);

  const effectivePrice = isCustomPriceActive && customFinalPrice !== null
    ? customFinalPrice
    : quoteResult.suggestedFinalPrice;

  const discountValue = quoteResult.suggestedFinalPrice - effectivePrice;
  const isBelowCost = effectivePrice < baseCostIrreducible;
  const estimatedProfitMargin = effectivePrice - baseCostIrreducible;

  // Sincronizar quando a sugestão do motor mudar (se não customizado)
  useEffect(() => {
    if (!isCustomPriceActive) {
      setCustomFinalPrice(quoteResult.suggestedFinalPrice);
    }
  }, [quoteResult.suggestedFinalPrice, isCustomPriceActive]);

  // Função para disparar a Server Action com Toast elegante:
  const handleSaveQuoteToDb = async () => {
    if (!clientName.trim()) {
      toast.error('Informe o nome do cliente antes de salvar.');
      return;
    }

    const toastId = toast.loading('Salvando proposta negociada...');
    const result = await saveQuoteAction({
      clientName,
      clientPhone,
      totalAreaM2: quoteResult.totalAreaM2,
      suggestedFinalPrice: quoteResult.suggestedFinalPrice,
      finalAgreedPrice: effectivePrice,
      discountApplied: discountValue > 0 ? discountValue : 0,
      roomsData: rooms,
      materialsSnapshot: quoteResult.rooms,
    });

    if (result.success) {
      toast.success('Orçamento salvo no banco com sucesso!', { id: toastId });
    } else {
      toast.error(result.error || 'Erro ao salvar.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Topo do Painel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red">
              Painel Administrativo O Ponto do Gesso
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-dark mt-1">
              Gerador Inteligente de Orçamentos
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Cálculo paramétrico determinístico para gesso tradicional e
              revestimentos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/precos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all border border-neutral-200"
            >
              <Settings className="w-4 h-4" /> Ajustar Preços
            </Link>
            <Link
              href="/admin/estoque"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all border border-neutral-200"
            >
              <Package className="w-4 h-4" /> Estoque & Cargas
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logoutAdmin();
                window.location.href = "/admin/login";
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 text-xs font-bold transition-all border border-neutral-200"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
              Nome do Cliente
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Maria da Silva"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
              WhatsApp / Contato
            </label>
            <input
              type="tel"
              inputMode="tel"
              value={clientPhone}
              maxLength={15}
              onChange={(e) => setClientPhone(formatPhoneValue(e.target.value))}
              placeholder="(79) 99999-9999"
              pattern="^\(\d{2}\)\s\d{5}-\d{4}$"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            />
          </div>
        </div>

        {/* Grid Principal: Cômodos e Resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lado Esquerdo: Lista de Cômodos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-charcoal-dark flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-red" /> Cômodos e
                Ambientes
              </h2>
              <button
                type="button"
                onClick={handleAddRoom}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Adicionar Cômodo
              </button>
            </div>

            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4"
              >
                {/* Cabeçalho do Cômodo */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) =>
                      handleRoomChange(room.id, "name", e.target.value)
                    }
                    className="font-bold text-lg text-brand-charcoal-dark bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-brand-red focus:outline-none px-1"
                  />
                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(room.id)}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Medidas (Largura x Comprimento) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase">
                      Comprimento (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={MAX_DIMENSION_METERS}
                      step="0.1"
                      value={room.lengthMeters}
                      onChange={(e) =>
                        handleRoomChange(
                          room.id,
                          "lengthMeters",
                          Number(e.target.value),
                        )
                      }
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase">
                      Largura (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={MAX_DIMENSION_METERS}
                      step="0.1"
                      value={room.widthMeters}
                      onChange={(e) =>
                        handleRoomChange(
                          room.id,
                          "widthMeters",
                          Number(e.target.value),
                        )
                      }
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-neutral-50 p-2 rounded-lg flex flex-col justify-center border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                      Área Calculada
                    </span>
                    <span className="text-sm font-extrabold text-brand-charcoal-dark">
                      {(room.lengthMeters * room.widthMeters).toFixed(2)} m²
                    </span>
                  </div>
                </div>

                {/* Serviços do Cômodo */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600 uppercase">
                      Serviços Executados neste Cômodo
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddService(room.id)}
                      className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-1"
                    >
                      + Incluir Serviço
                    </button>
                  </div>

                  {room.services.map((srv, srvIdx) => (
                    <div
                      key={srvIdx}
                      className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200"
                    >
                      <select
                        value={srv.type}
                        onChange={(e) =>
                          handleServiceChange(
                            room.id,
                            srvIdx,
                            "type",
                            e.target.value,
                          )
                        }
                        className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium bg-white"
                      >
                        <option value="FORRO_PLAQUINHA_60X60">
                          Forro Tradicional Plaquinha (60x60)
                        </option>
                        <option value="REVESTIMENTO_GESSO_LISO">
                          Revestimento de Gesso Liso em Parede
                        </option>
                        <option value="SANCA_ABERTA_GESSO">Sanca Aberta</option>
                        <option value="SANCA_FECHADA_GESSO">
                          Sanca Fechada
                        </option>
                        <option value="MOLDURA_RODATOPO">
                          Moldura / Roda-topo
                        </option>
                        <option value="CORTINEIRO_GESSO">
                          Cortineiro de Gesso
                        </option>
                      </select>

                      {/* Se for sanca ou moldura, pede metragem linear */}
                      {(srv.type.includes("SANCA") ||
                        srv.type.includes("MOLDURA") ||
                        srv.type.includes("CORTINEIRO")) && (
                        <div className="w-full sm:w-32">
                          <input
                            type="number"
                            min="0"
                            max={MAX_LINEAR_METERS}
                            placeholder="Metros lineares"
                            value={srv.customLinearMeters || ""}
                            onChange={(e) =>
                              handleServiceChange(
                                room.id,
                                srvIdx,
                                "customLinearMeters",
                                Number(e.target.value),
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveService(room.id, srvIdx)}
                        className="text-neutral-400 hover:text-red-600 p-1 self-end sm:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Lado Direito: Resumo do Orçamento & Materiais */}
          <div className="lg:col-span-1 space-y-6">
            {/* PAINEL LATERAL DIREITO: RESUMO & NEGOCIAÇÃO COMERCIAL */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-base font-bold text-brand-charcoal-dark">Fechamento da Proposta</h2>
                <p className="text-xs text-neutral-400">Sugestão paramétrica versus valor acordado no balcão.</p>
              </div>

              {/* Resumo de Custos Diretos */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Custo Estimado Insumos:</span>
                  <span className="font-semibold">{quoteResult.totalMaterialCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Mão de Obra Parceira:</span>
                  <span className="font-semibold">{quoteResult.totalLaborCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between text-neutral-500 font-bold border-t border-neutral-100 pt-2">
                  <span>Custo Base Mínimo:</span>
                  <span>{baseCostIrreducible.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>

              {/* Sugestão vs Negociado */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-600">Sugestão de Tabela:</span>
                  <span className="text-sm font-bold text-neutral-800">
                    {quoteResult.suggestedFinalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* Toggle de Negociação */}
                <div className="pt-2 border-t border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-charcoal-dark flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCustomPriceActive}
                        onChange={(e) => {
                          setIsCustomPriceActive(e.target.checked);
                          if (e.target.checked && customFinalPrice === null) {
                            setCustomFinalPrice(quoteResult.suggestedFinalPrice);
                          }
                        }}
                        className="w-4 h-4 rounded text-brand-red focus:ring-brand-red"
                      />
                      Ajustar Valor Negociado
                    </label>
                    {isCustomPriceActive && (
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Manual</span>
                    )}
                  </div>

                  {isCustomPriceActive && (
                    <div className="space-y-2 pt-1">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">R$</span>
                        <input
                          type="number"
                          step="10"
                          value={customFinalPrice ?? ''}
                          onChange={(e) => setCustomFinalPrice(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-xl border border-neutral-300 focus:outline-none focus:border-brand-red bg-white"
                        />
                      </div>

                      {/* Indicadores de Desconto / Acréscimo */}
                      {discountValue > 0 && (
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Desconto concedido: R$ {discountValue.toFixed(2)} (-{((discountValue / quoteResult.suggestedFinalPrice) * 100).toFixed(1)}%)
                        </p>
                      )}
                      {discountValue < 0 && (
                        <p className="text-[11px] text-blue-700 font-semibold">
                          Acréscimo aplicado: + R$ {Math.abs(discountValue).toFixed(2)} (+{((Math.abs(discountValue) / quoteResult.suggestedFinalPrice) * 100).toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Alerta de Risco / Margem */}
              {isBelowCost ? (
                <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-xl text-rose-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertTriangle className="w-4 h-4" /> Valor Abaixo do Custo Mínimo!
                  </div>
                  <p className="text-[11px]">
                    O valor acordado (R$ {effectivePrice.toFixed(2)}) não cobre os insumos e a mão de obra (R$ {baseCostIrreducible.toFixed(2)}). Prejuízo estimado de R$ {Math.abs(estimatedProfitMargin).toFixed(2)}.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-700 font-bold block">Margem Líquida Estimada:</span>
                    <span className="text-[11px] text-emerald-600">Após pagar gesseiro e materiais</span>
                  </div>
                  <span className="text-base font-black text-emerald-800">
                    + {estimatedProfitMargin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              )}

              {/* Valor Final Destacado */}
              <div className="bg-brand-charcoal-dark text-white p-4 rounded-xl text-center space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-semibold">Valor Final da Proposta</span>
                <span className="text-2xl sm:text-3xl font-black text-brand-red-light">{effectivePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>

              {/* Ações */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {  
                    if (!clientName.trim()) {
                      toast.error('Informe o nome do cliente antes de salvar.');
                      return;
                    }

                    const toastId = toast.loading('Salvando proposta negociada...');
                    const result = await saveQuoteAction({
                      clientName,
                      clientPhone,
                      totalAreaM2: quoteResult.totalAreaM2,
                      suggestedFinalPrice: quoteResult.suggestedFinalPrice,
                      finalAgreedPrice: effectivePrice,
                      discountApplied: discountValue > 0 ? discountValue : 0,
                      roomsData: rooms,
                      materialsSnapshot: quoteResult.rooms,
                    });

                    if (result.success) {
                      toast.success('Orçamento salvo no banco com sucesso!', { id: toastId });
                    } else {
                      toast.error(result.error || 'Erro ao salvar.', { id: toastId });
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-2"
                >
                  <BookmarkCheck className="w-4 h-4" /> Salvar Orçamento no Sistema
                </button>

                <button
                  type="button"
                  onClick={() => {
                    generateQuotePDF({
                      clientName,
                      clientPhone,
                      rooms,
                      quote: {
                        totalAreaM2: quoteResult.totalAreaM2,
                        suggestedFinalPrice: quoteResult.suggestedFinalPrice,
                        finalAgreedPrice: effectivePrice,
                      },
                    });
                  }}
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-brand-charcoal-dark font-bold py-3 rounded-xl transition-all border border-neutral-200 text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-brand-red" /> Baixar PDF com Valor Acordado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
