import { ArrowUpRight, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { services } from '../data/offerings';
import { companyData } from '../data/company';

export function Services() {
  const whatsappGeralUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Tenho a planta/medidas do meu imóvel e gostaria de um orçamento completo para todos os cômodos.'
  )}`;

  return (
    <section id="servicos" className="py-20 lg:py-28 bg-[#f8f9fa] border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* CABEÇALHO DA SEÇÃO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-xs font-bold text-brand-red uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Mão de Obra Especializada
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal-dark tracking-tight leading-[1.15]">
              Soluções completas em instalação & acabamento.
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
              Trabalho técnico com alinhamento a laser, amarração estruturada e descarte limpo para projetos residenciais e comerciais.
            </p>
          </div>

          <a
            href={whatsappGeralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-red hover:text-brand-red-dark bg-white border border-neutral-200/80 hover:border-brand-red px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all self-start md:self-end shrink-0"
          >
            <span>Orçar Obra Completa (Múltiplos Cômodos)</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* GRID DE SERVIÇOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const whatsappServiceUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
              `Olá! Gostaria de um orçamento detalhado para o serviço de ${service.title}.`
            )}`;

            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between p-6 sm:p-7 bg-white rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-xl hover:border-brand-red/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="space-y-5">
                  {/* Topo do Card: Ícone e Tag */}
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 p-3 rounded-2xl bg-neutral-100/80 text-brand-charcoal-dark border border-neutral-200/50 group-hover:bg-brand-red group-hover:text-white group-hover:border-brand-red transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    {service.tag && (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 group-hover:bg-brand-red/10 group-hover:text-brand-red group-hover:border-brand-red/20 transition-colors">
                        {service.tag}
                      </span>
                    )}
                  </div>

                  {/* Textos */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-brand-charcoal-dark tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Botão de Orçamento no Rodapé do Card */}
                <a
                  href={whatsappServiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-brand-charcoal-dark group-hover:text-brand-red transition-colors"
                >
                  <span>Solicitar este serviço</span>
                  <div className="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-brand-red group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* BANNER COMPLEMENTAR: ATENDIMENTO PARA ENGENHEIROS E CONSTRUTORAS */}
        <div className="bg-brand-charcoal-dark rounded-3xl p-8 sm:p-10 border border-neutral-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-brand-red-light shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Construtora, Arquiteto ou Empreiteiro?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                Temos capacidade de escala para fornecimento simultâneo de material por carreta e equipes para grandes metragens.
              </p>
            </div>
          </div>

          <a
            href={whatsappGeralUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all relative z-10 shrink-0"
          >
            Falar com Gestor de Obras
          </a>
        </div>

      </div>
    </section>
  );
}