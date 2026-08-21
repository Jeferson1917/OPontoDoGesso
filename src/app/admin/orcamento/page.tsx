// src/app/admin/orcamento/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoomInput, RoomServiceItem } from "../../data/calculatorTypes";
import { defaultPricingConfig } from "../../data/pricingConfig";
import { generateProjectQuote } from "../../utils/quoteEngine";
import { logoutAdmin } from "../../actions/authActions";
import { generateQuotePDF } from "../../utils/pdfGenerator";
import { Download } from "lucide-react";
import { LogOut, Settings } from "lucide-react";
import { Trash2, Plus, Calculator, FileText, CheckCircle2 } from "lucide-react";

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
            <div className="bg-brand-charcoal-dark text-white p-6 rounded-3xl shadow-lg sticky top-6 space-y-6">
              <div>
                <span className="text-xs font-semibold tracking-widest text-brand-red-light uppercase">
                  Resumo Financeiro
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-1">
                  Proposta Comercial
                </h3>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-neutral-300">
                  <span>Área Total:</span>
                  <span className="font-bold text-white">
                    {quoteResult.totalAreaM2} m²
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Custo de Materiais:</span>
                  <span className="font-bold text-white">
                    R$ {quoteResult.totalMaterialCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Custo de Mão de Obra:</span>
                  <span className="font-bold text-white">
                    R$ {quoteResult.totalLaborCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                  Preço Final Sugerido
                </span>
                <span className="text-3xl font-extrabold text-brand-red-light mt-1 block">
                  R$ {quoteResult.suggestedFinalPrice.toFixed(2)}
                </span>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  *Inclui margem operacional e fator de segurança de quebra.
                </span>
              </div>

              {/* Lista Consolidada de Materiais */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-red-light" /> Lista de
                  Compra de Materiais
                </h4>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
                  {(() => {
                    const materialMap: {
                      [key: string]: { qty: number; unit: string };
                    } = {};
                    quoteResult.rooms.forEach((room) => {
                      room.materials.forEach((mat) => {
                        if (!materialMap[mat.name]) {
                          materialMap[mat.name] = { qty: 0, unit: mat.unit };
                        }
                        materialMap[mat.name].qty += mat.quantity;
                      });
                    });

                    return Object.entries(materialMap).map(
                      ([name, data], idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg"
                        >
                          <span className="text-neutral-200">{name}</span>
                          <span className="font-bold text-brand-red-light">
                            {data.qty} {data.unit}
                          </span>
                        </div>
                      ),
                    );
                  })()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const summaryText = `Olá, ${clientName || "Cliente"}! Segue o orçamento para sua obra de gesso:\n\nÁrea Total: ${quoteResult.totalAreaM2}m²\nValor Total: R$ ${quoteResult.suggestedFinalPrice.toFixed(2)}\n\nO Ponto do Gesso.`;
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(summaryText)}`,
                    "_blank",
                  );
                }}
                className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-center block"
              >
                Enviar Orçamento via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  generateQuotePDF({
                    clientName,
                    clientPhone,
                    rooms,
                    quote: quoteResult,
                  });
                }}
                className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/20 text-center text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-brand-red-light" /> Baixar
                Proposta em PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
