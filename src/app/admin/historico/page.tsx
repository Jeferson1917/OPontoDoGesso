"use client";

import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import {
  getQuotesAction,
  updateQuoteStatusAction,
  deleteQuoteAction,
} from "../../actions/quoteActions";
import { generateQuotePDF } from "../../utils/pdfGenerator";
import type { RoomInput } from "../../data/calculatorTypes";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { QuoteStatus } from "@prisma/client";
import { formatBusinessDate } from "../../utils/dates";
import { summarizePayments } from "../../utils/payments";
import { PaymentsPanel } from "./PaymentsPanel";
import { matchesQuoteFilter, type PaymentFilter, type QuoteFilter } from "../../utils/quoteFilters";
import { ALLOWED_STATUS_TRANSITIONS, QUOTE_STATUS_LABELS } from "../../data/quoteStatus";

type QuotesResult = Awaited<ReturnType<typeof getQuotesAction>>;
type QuoteRow = Extract<QuotesResult, { success: true }>["quotes"][number];

export default function AdminQuotesHistoryPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<QuoteFilter>({ text: '', status: 'TODOS', payment: 'TODOS' });

  const visibleQuotes = quotes.filter((q) =>
    matchesQuoteFilter(
      { ...q, price: q.finalAgreedPrice > 0 ? q.finalAgreedPrice : q.suggestedFinalPrice },
      filter
    )
  );

  const applyQuotes = (res: QuotesResult) => {
    if (res.success) {
      setQuotes(res.quotes);
    } else {
      toast.error(res.error || "Erro ao buscar histórico de orçamentos.");
    }
    setLoading(false);
  };

  const fetchQuotes = async () => {
    setLoading(true);
    applyQuotes(await getQuotesAction());
  };

  useEffect(() => {
    getQuotesAction().then(applyQuotes);
  }, []);

  const handleStatusChange = async (id: string, newStatus: QuoteStatus) => {
    const toastId = toast.loading('Atualizando status e estoque...');
    const res = await updateQuoteStatusAction(id, newStatus);

    if (res.success) {
      const label = QUOTE_STATUS_LABELS[newStatus];
      if (res.deducted) {
        toast.success(`Status alterado para ${label} e materiais baixados do estoque!`, { id: toastId });
      } else if (res.refunded) {
        toast.success(`Status alterado para ${label}. Materiais devolvidos ao estoque.`, { id: toastId });
      } else {
        toast.success(`Status atualizado para ${label}!`, { id: toastId });
      }

      // Recarrega para refletir também a baixa/devolução de estoque
      fetchQuotes();
    } else {
      toast.error(res.error || 'Falha ao atualizar status.', { id: toastId });
    }
  };

  const handleDeleteQuote = async (id: string, clientName: string) => {
    if (!confirm(`Excluir o orçamento de ${clientName}? Essa ação não pode ser desfeita.`)) return;
    const toastId = toast.loading('Excluindo orçamento...');
    const res = await deleteQuoteAction(id);
    if (res.success) {
      toast.success('Orçamento excluído.', { id: toastId });
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } else {
      toast.error(res.error, { id: toastId });
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

        {/* Busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            aria-label="Buscar por cliente ou telefone"
            placeholder="Buscar por cliente ou telefone..."
            value={filter.text}
            onChange={(e) => setFilter({ ...filter, text: e.target.value })}
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
          />
          <select
            aria-label="Filtrar por status"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white"
          >
            <option value="TODOS">Todos os status</option>
            {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((s) => (
              <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            aria-label="Filtrar por pagamento"
            value={filter.payment}
            onChange={(e) => setFilter({ ...filter, payment: e.target.value as PaymentFilter })}
            className="px-3 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white"
          >
            <option value="TODOS">Todos os pagamentos</option>
            <option value="A_RECEBER">A receber</option>
            <option value="QUITADO">Quitados</option>
          </select>
        </div>
        {quotes.length > 0 && (
          <p className="text-xs text-neutral-500 -mt-3">
            {visibleQuotes.length === quotes.length
              ? `${quotes.length} orçamento${quotes.length > 1 ? 's' : ''}`
              : `${visibleQuotes.length} de ${quotes.length} orçamentos`}
          </p>
        )}

        {/* Tabela de Orçamentos */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {visibleQuotes.length === 0 && !loading ? (
            <div className="p-12 text-center text-neutral-400 text-sm">
              {quotes.length === 0 ? 'Nenhum orçamento salvo no banco de dados ainda.' : 'Nenhum orçamento encontrado com esses filtros.'}
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
                  {visibleQuotes.map((quote) => {
                    const effectivePrice = (quote.finalAgreedPrice && quote.finalAgreedPrice > 0)
                      ? quote.finalAgreedPrice
                      : quote.suggestedFinalPrice;

                    const payment = summarizePayments(effectivePrice, quote.payments);
                    const expanded = expandedId === quote.id;

                    return (
                      <Fragment key={quote.id}>
                      <tr className="hover:bg-neutral-50/60 transition-colors">
                        <td className="p-4 font-medium text-neutral-500">
                          {formatBusinessDate(quote.createdAt)}
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
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : quote.id)}
                            className={`mt-1 block text-[10px] font-bold hover:underline ${
                              payment.status === 'QUITADO' ? 'text-emerald-700' : payment.status === 'PARCIAL' ? 'text-amber-700' : 'text-neutral-500'
                            }`}
                            aria-expanded={expanded}
                          >
                            {payment.status === 'QUITADO'
                              ? 'Quitado'
                              : payment.status === 'PARCIAL'
                                ? `Pago ${payment.paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · falta ${payment.remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                                : 'Nada recebido'}{' '}
                            {expanded ? '▲' : '▼'}
                          </button>
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
                              {/* Só o status atual e as transições permitidas */}
                              {[quote.status, ...ALLOWED_STATUS_TRANSITIONS[quote.status]].map((status) => (
                                <option key={status} value={status}>
                                  {QUOTE_STATUS_LABELS[status]}
                                </option>
                              ))}
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
                                rooms: quote.roomsData as unknown as RoomInput[], // validado pelo zod ao salvar
                                issuedAt: quote.createdAt,
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
                          {!quote.stockDeducted && (quote.status === "PENDENTE" || quote.status === "CANCELADO") && (
                            <button
                              type="button"
                              onClick={() => handleDeleteQuote(quote.id, quote.clientName)}
                              className="ml-1 p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors align-middle"
                              aria-label={`Excluir orçamento de ${quote.clientName}`}
                              title="Excluir orçamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={6} className="bg-neutral-50 px-4 py-4 border-t border-neutral-200">
                            <PaymentsPanel
                              key={`${quote.id}-${payment.paid}`} // recomeça o formulário com o novo "falta"
                              quoteId={quote.id}
                              total={effectivePrice}
                              cancelled={quote.status === 'CANCELADO'}
                              payments={quote.payments}
                              onChanged={fetchQuotes}
                            />
                          </td>
                        </tr>
                      )}
                      </Fragment>
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