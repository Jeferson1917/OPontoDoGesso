"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoomInput, RoomServiceItem } from "../../data/calculatorTypes";
import { defaultPricingConfig } from "../../data/pricingConfig";
import { generateProjectQuote } from "../../utils/quoteEngine";
import { logoutAdmin } from "../../actions/authActions";
import { generateQuotePDF } from "../../utils/pdfGenerator";
import { saveQuoteAction } from "../../actions/quoteActions";
import { loadPricingConfig } from "../../utils/pricingClient";
import { toast } from "sonner";
import { LogOut, Settings, Package, Plus, Calculator } from "lucide-react";
import { RoomCard } from "./_components/RoomCard";
import { QuoteSummary } from "./_components/QuoteSummary";
import { MAX_DIMENSION_METERS, MAX_LINEAR_METERS, MAX_WALL_HEIGHT_METERS } from "./_components/limits";

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
      services: [{ type: "FORRO_PLAQUINHA_60X60" }],
    },
  ]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [pricingConfig, setPricingConfig] = useState(defaultPricingConfig);
  const [customFinalPrice, setCustomFinalPrice] = useState<number | null>(null);
  const [isCustomPriceActive, setIsCustomPriceActive] = useState(false);

  useEffect(() => {
    loadPricingConfig().then(({ config, error }) => {
      setPricingConfig(config);
      if (error) toast.error(`${error} Usando os preços padrão.`);
    });
  }, []);

  const handleAddRoom = () => {
    const newRoom: RoomInput = {
      id: Date.now().toString(),
      name: `Cômodo ${rooms.length + 1}`,
      lengthMeters: 3,
      widthMeters: 3,
      services: [{ type: "FORRO_PLAQUINHA_60X60" }],
    };
    setRooms([...rooms, newRoom]);
  };

  const handleRemoveRoom = (id: string) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  const handleRoomChange = (
    id: string,
    field: keyof RoomInput,
    value: string | number,
  ) => {
    setRooms(
      rooms.map((room) => {
        if (room.id !== id) return room;
        if (field === "lengthMeters" || field === "widthMeters") {
          return {
            ...room,
            [field]: clampMetricValue(Number(value), MAX_DIMENSION_METERS, 0),
          };
        }
        if (field === "wallHeightMeters") {
          return {
            ...room,
            wallHeightMeters: clampMetricValue(Number(value), MAX_WALL_HEIGHT_METERS, 0),
          };
        }
        return { ...room, [field]: value };
      }),
    );
  };

  const handleAddService = (roomId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const newService: RoomServiceItem = {
            type: "MOLDURA_RODATOPO",
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

  const handleServiceChange = (
    roomId: string,
    serviceIndex: number,
    field: keyof RoomServiceItem,
    value: RoomServiceItem[keyof RoomServiceItem],
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

  const quoteResult = generateProjectQuote(rooms, pricingConfig);

  const effectivePrice =
    isCustomPriceActive && customFinalPrice !== null
      ? customFinalPrice
      : quoteResult.suggestedFinalPrice;

  const discountValue = quoteResult.suggestedFinalPrice - effectivePrice;

  const handleToggleCustomPrice = (active: boolean) => {
    setIsCustomPriceActive(active);
    // Ao ligar o ajuste, parte do preço sugerido atual
    if (active) setCustomFinalPrice(quoteResult.suggestedFinalPrice);
  };

  const handleDownloadPdf = () => {
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
  };

  const handleSaveQuoteToDb = async () => {
    if (!clientName.trim()) {
      toast.error("Informe o nome do cliente antes de salvar.");
      return;
    }

    const toastId = toast.loading("Salvando proposta negociada...");
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
      toast.success("Orçamento salvo no banco com sucesso!", { id: toastId });
    } else {
      toast.error(result.error || "Erro ao salvar.", { id: toastId });
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-neutral-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Topo do Painel */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-brand-red">
              Painel Administrativo O Ponto do Gesso
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-dark mt-1">
              Gerador Inteligente de Orçamentos
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Cálculo paramétrico determinístico para gesso tradicional e revestimentos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/precos"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all border border-neutral-200"
            >
              <Settings className="w-4 h-4 text-neutral-600" /> Ajustar Preços
            </Link>
            <Link
              href="/admin/estoque"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all border border-neutral-200"
            >
              <Package className="w-4 h-4 text-neutral-600" /> Estoque & Cargas
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logoutAdmin(); // a action já redireciona para /admin/login
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-700 text-xs font-bold transition-all border border-neutral-200"
              aria-label="Encerrar sessão administrativa"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </header>

        {/* Dados do Cliente */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="client-name-input" className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              Nome do Cliente
            </label>
            <input
              id="client-name-input"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Maria da Silva"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/50 text-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="client-phone-input" className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              WhatsApp / Contato
            </label>
            <input
              id="client-phone-input"
              type="tel"
              inputMode="tel"
              value={clientPhone}
              maxLength={15}
              onChange={(e) => setClientPhone(formatPhoneValue(e.target.value))}
              placeholder="(79) 99999-9999"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/50 text-neutral-900"
            />
          </div>
        </section>

        {/* Grid Principal: Cômodos e Resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lado Esquerdo: Lista de Cômodos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-charcoal-dark flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-red" /> Cômodos e Ambientes
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
              <RoomCard
                key={room.id}
                room={room}
                canRemove={rooms.length > 1}
                onChange={(field, value) => handleRoomChange(room.id, field, value)}
                onRemove={() => handleRemoveRoom(room.id)}
                onAddService={() => handleAddService(room.id)}
                onRemoveService={(idx) => handleRemoveService(room.id, idx)}
                onServiceChange={(idx, field, value) => handleServiceChange(room.id, idx, field, value)}
              />
            ))}
          </div>

          {/* Lado Direito: Resumo do Orçamento & Negociação */}
          <div className="lg:col-span-1 space-y-6">
            <QuoteSummary
              quoteResult={quoteResult}
              effectivePrice={effectivePrice}
              isCustomPriceActive={isCustomPriceActive}
              customFinalPrice={customFinalPrice}
              onToggleCustomPrice={handleToggleCustomPrice}
              onCustomPriceChange={setCustomFinalPrice}
              onSave={handleSaveQuoteToDb}
              onDownloadPdf={handleDownloadPdf}
            />
          </div>
        </div>
      </div>
    </main>
  );
}