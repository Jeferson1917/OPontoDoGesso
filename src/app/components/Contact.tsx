import { MapPin, Phone, Clock, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { companyData } from '../data/company';

export function Contact() {
  const whatsappUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Gostaria de tirar dúvidas sobre localização, materiais e orçamentos para minha obra.'
  )}`;

  return (
    <section id="contato" className="py-20 lg:py-28 bg-[#f8f9fa] border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* CABEÇALHO DA SEÇÃO */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-xs font-bold text-brand-red uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Onde Estamos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal-dark tracking-tight leading-[1.15]">
            Fale conosco ou visite nosso galpão.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Venha retirar materiais a pronta entrega ou agende a visita de um especialista para medição e consultoria técnica no seu imóvel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* COLUNA DA ESQUERDA: CARDS DE INFORMAÇÕES (5 colunas) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs hover:border-brand-red/30 transition-colors flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-brand-charcoal-dark text-sm">Localização do Galpão</h4>
                <p className="text-neutral-600 text-xs font-medium">{companyData.address}</p>
                <p className="text-neutral-400 text-[11px]">{companyData.city}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs hover:border-brand-red/30 transition-colors flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-brand-charcoal-dark text-sm">Horário de Expedição</h4>
                <p className="text-neutral-600 text-xs font-medium">{companyData.hours}</p>
                <p className="text-neutral-400 text-[11px]">Carregamento rápido no pátio</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs hover:border-brand-red/30 transition-colors flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-brand-charcoal-dark text-sm">WhatsApp & Atendimento</h4>
                <p className="text-neutral-600 text-xs font-medium">{companyData.phone}</p>
                <p className="text-neutral-400 text-[11px]">Cotações e suporte técnico direto</p>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: CARD DE CONVERSÃO / PROPOSTA SEM COMPROMISSO (7 colunas) */}
          <div className="lg:col-span-7 bg-brand-charcoal-dark text-white rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl border border-neutral-800 relative overflow-hidden">
            {/* Brilho Atmosférico */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-brand-red/20 blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-red-light block">
                Atendimento Técnico Imediato
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Precisa de um orçamento detalhado sem compromisso?
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Envie as metragens aproximadas, a planta baixa ou a lista de placas e insumos necessários. Nossa equipe retorna rapidamente com o cálculo completo em PDF.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 hover:-translate-y-0.5 transition-all group"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversar com Especialista</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <span className="text-xs text-neutral-400 text-center sm:text-right font-medium">
                Resposta rápida no horário comercial
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}