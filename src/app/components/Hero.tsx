// src/components/Hero.tsx
import { ShieldCheck, Clock, Hammer, ShoppingCart, ArrowRight } from 'lucide-react';
import { companyData } from '../data/company';

export function Hero() {
  const whatsappObraUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Gostaria de solicitar um orçamento para serviço de gesso.'
  )}`;

  const whatsappMaterialUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Gostaria de consultar preços e disponibilidade de materiais de gesso.'
  )}`;

  const stats = [
    {
      icon: Hammer,
      title: 'Mão de Obra Especializada',
      desc: 'Acabamento fino e equipe qualificada',
    },
    {
      icon: ShoppingCart,
      title: 'Materiais a Pronta Entrega',
      desc: 'Placas, perfis, gesso em pó e acessórios',
    },
    {
      icon: Clock,
      title: 'Compromisso com Prazos',
      desc: 'Agilidade e pontualidade na entrega',
    },
    {
      icon: ShieldCheck,
      title: 'Garantia de Qualidade',
      desc: 'Durabilidade e estrutura impecável',
    },
  ];

  return (
    <section id="hero" className="relative bg-brand-charcoal-dark text-white overflow-hidden">
      {/* Detalhe de fundo com gradiente sutil puxando o tom vinho */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-brand-red/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-3xl space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs sm:text-sm text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            Serviços residenciais, comerciais e venda direta
          </div>

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Soluções completas em <span className="text-brand-red">gesso</span> e venda de materiais.
          </h1>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed max-w-2xl">
            Transforme seu ambiente com forros modernos, sancas iluminadas e divisórias de alto padrão. Fornecemos também todos os insumos para a sua obra a pronta entrega.
          </p>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href={whatsappObraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-6 py-4 rounded-xl shadow-lg transition-all"
            >
              <span>Solicitar Orçamento de Obra</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={whatsappMaterialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 py-4 rounded-xl transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-neutral-300" />
              <span>Consultar Catálogo de Materiais</span>
            </a>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-brand-charcoal text-brand-red-light border border-neutral-700 shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-100 text-base">{item.title}</h3>
                    <p className="text-sm text-neutral-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}