// src/components/Services.tsx
import { ArrowUpRight } from 'lucide-react';
import { services } from '../data/offerings';
import { companyData } from '../data/company';

export function Services() {
  return (
    <section id="servicos" className="py-20 lg:py-28 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="max-w-2xl">
          <span className="text-sm font-bold tracking-wider text-brand-red uppercase">
            Mão de Obra Especializada
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal-dark tracking-tight mt-2">
            Nossos Serviços de Instalação e Acabamento
          </h2>
          <p className="text-neutral-600 mt-4 text-base sm:text-lg">
            Execução ágil, limpa e com atenção aos mínimos detalhes para reformas residenciais e projetos comerciais.
          </p>
        </div>

        {/* Grid de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            const whatsappServiceUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
              `Olá! Gostaria de um orçamento para o serviço de ${service.title}.`
            )}`;

            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-brand-red/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-brand-charcoal group-hover:bg-brand-red group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
                      {service.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-charcoal-dark mt-6">
                    {service.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <a
                  href={whatsappServiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 pt-4 border-t border-neutral-100 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:text-brand-red-dark group-hover:translate-x-0.5 transition-all"
                >
                  <span>Orçar este serviço</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}