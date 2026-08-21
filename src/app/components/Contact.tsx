// src/app/components/Contact.tsx
import { MapPin, Phone, Clock, MessageSquare } from 'lucide-react';
import { companyData } from '../data/company';

export function Contact() {
  const whatsappUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Gostaria de tirar dúvidas sobre a localização e orçamentos da loja.'
  )}`;

  return (
    <section id="contato" className="py-20 lg:py-28 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <span className="text-sm font-bold tracking-wider text-brand-red uppercase">
            Onde Estamos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal-dark tracking-tight mt-2">
            Fale Conosco ou Visite Nossa Loja
          </h2>
          <p className="text-neutral-600 mt-3 text-base sm:text-lg">
            Venha conhecer nosso estoque ou solicite a visita de um profissional para medição no local da sua obra.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card de Informações de Contato */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-brand-charcoal-dark text-base">Endereço</h4>
                <p className="text-neutral-600 text-sm mt-1">{companyData.address}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{companyData.city}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-brand-charcoal-dark text-base">Horário de Funcionamento</h4>
                <p className="text-neutral-600 text-sm mt-1">{companyData.hours}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-brand-charcoal-dark text-base">Telefone / WhatsApp</h4>
                <p className="text-neutral-600 text-sm mt-1">{companyData.phone}</p>
              </div>
            </div>
          </div>

          {/* Card de Ação Rápida */}
          <div className="lg:col-span-2 bg-brand-charcoal-dark text-white rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-brand-red/15 blur-3xl pointer-events-none" />

            <div>
              <span className="text-xs font-semibold tracking-widest text-brand-red-light uppercase">
                Atendimento Ágil
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
                Precisa de um orçamento sem compromisso?
              </h3>
              <p className="text-neutral-300 text-sm sm:text-base mt-4 leading-relaxed max-w-xl">
                Envie as medidas aproximadas do seu cômodo ou a lista de materiais que você precisa. Nossa equipe responde rapidamente com a melhor cotação.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-6 py-4 rounded-xl shadow-md transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Conversar com Atendente</span>
              </a>
              <span className="text-xs text-neutral-400 text-center sm:text-left">
                Atendimento rápido de segunda a sábado.
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}