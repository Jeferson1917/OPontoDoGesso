"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getQuotesAction,
  updateQuoteStatusAction,
} from "../../actions/quoteActions";
import { generateQuotePDF } from "../../utils/pdfGenerator";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { QuoteStatus } from "@prisma/client";

export default function AdminQuotesHistoryPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    setLoading(true);
    const res = await getQuotesAction();
    if (res.success && res.quotes) {
      setQuotes(res.quotes);
    } else {
      toast.error("Erro ao buscar histórico de orçamentos.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleStatusChange = async (id: string, newStatus: QuoteStatus) => {
    const toastId = toast.loading('Atualizando status e estoque...');
    const res = await updateQuoteStatusAction(id, newStatus);

    if (res.success) {
      if (res.deducted) {
        toast.success(`Status alterado para ${newStatus} e materiais baixados do estoque!`, { id: toastId });
      } else if (res.refunded) {
        toast.success(`Obra cancelada. Materiais devolvidos ao estoque com sucesso!`, { id: toastId });
      } else {
        toast.success(`Status atualizado para ${newStatus}!`, { id: toastId });
      }

      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
      );
    } else {
      toast.error(res.error || 'Falha ao atualizar status.', { id: toastId });
    }
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case "PENDENTE":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> Pendente
          </span>
        );
      case "APROVADO":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
          </span>
        );
      case "EM_EXECUCAO":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
            <PlayCircle className="w-3.5 h-3.5" /> Em Obra
          </span>
        );
      case "CONCLUIDO":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
          </span>
        );
      case "CANCELADO":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
            <XCircle className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Topo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="space-y-1">
            <Link
              href="/admin/orcamento"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-red transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Orçamentista
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-dark">
              Histórico de Orçamentos & Obras
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Acompanhamento de propostas emitidas, status de aprovação e
              reemissão de propostas em PDF.
            </p>
          </div>

          <button
            onClick={fetchQuotes}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />{" "}
            Atualizar
          </button>
        </div>

        {/* Tabela de Orçamentos */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {quotes.length === 0 && !loading ? (
            <div className="p-12 text-center text-neutral-400 text-sm">
              Nenhum orçamento salvo no banco de dados ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase">
                    <th className="p-4">Data</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Metragem</th>
                    <th className="p-4">Valor Acordado</th>
                    <th className="p-4">Status da Proposta</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {quotes.map((quote) => {
                    const effectivePrice = (quote.finalAgreedPrice && quote.finalAgreedPrice > 0)
                      ? quote.finalAgreedPrice
                      : quote.suggestedFinalPrice;

                    return (
                      <tr
                        key={quote.id}
                        className="hover:bg-neutral-50/60 transition-colors"
                      >
                        <td className="p-4 font-medium text-neutral-500">
                          {new Date(quote.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-brand-charcoal-dark block">
                            {quote.clientName}
                          </span>
                          {quote.clientPhone && (
                            <span className="text-neutral-400 text-[11px]">
                              {quote.clientPhone}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-neutral-700">
                          {quote.totalAreaM2.toFixed(2)} m²
                        </td>
                        <td className="p-4 font-bold text-brand-red">
                          {effectivePrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                          {quote.discountApplied > 0 && (
                            <span className="block text-[10px] text-emerald-600 font-semibold">
                              Desc: -{quote.discountApplied.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(quote.status)}
                            <select
                              value={quote.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  quote.id,
                                  e.target.value as QuoteStatus,
                                )
                              }
                              className="text-[11px] bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-red font-semibold text-neutral-700"
                            >
                              <option value="PENDENTE">Pendente</option>
                              <option value="APROVADO">Aprovado</option>
                              <option value="EM_EXECUCAO">Em Obra</option>
                              <option value="CONCLUIDO">Concluído</option>
                              <option value="CANCELADO">Cancelado</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              generateQuotePDF({
                                clientName: quote.clientName,
                                clientPhone: quote.clientPhone || "",
                                rooms: quote.roomsData,
                                quote: {
                                  totalAreaM2: quote.totalAreaM2,
                                  suggestedFinalPrice: quote.suggestedFinalPrice,
                                  finalAgreedPrice: effectivePrice,
                                },
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-brand-red hover:text-white text-neutral-700 text-[11px] font-bold transition-all border border-neutral-200"
                          >
                            <FileText className="w-3.5 h-3.5" /> PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}