// src/app/components/About.tsx
import { historyData } from '../data/gallery';
import { Check } from 'lucide-react';

export function About() {
  return (
    <section id="sobre" className="py-20 lg:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Lado Esquerdo: História */}
          <div>
            <span className="text-sm font-bold tracking-wider text-brand-red uppercase">
              Quem Somos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal-dark tracking-tight mt-2">
              {historyData.title}
            </h2>

            <div className="space-y-4 mt-6 text-neutral-600 leading-relaxed text-base sm:text-lg">
              {historyData.story.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Pilares */}
            <div className="mt-8 space-y-4">
              {historyData.pillars.map((pillar, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-charcoal-dark">{pillar.title}</h4>
                    <p className="text-xs text-neutral-500">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lado Direito: Card Institucional em Destaque */}
          <div className="relative bg-brand-charcoal-dark text-white rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-brand-red/20 blur-2xl pointer-events-none" />

            <span className="text-xs font-semibold tracking-widest text-brand-red-light uppercase">
              Tradição e Segurança
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">
              A escolha certa para gesseiros, arquitetos e donos de obra.
            </h3>
            <p className="text-neutral-300 text-sm sm:text-base mt-4 leading-relaxed">
              Traga a sua planta, projeto ou lista de insumos. Nossa equipe técnica oferece suporte completo desde a cubagem de material até a entrega final.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-6">
              <div>
                <span className="block text-3xl font-extrabold text-white">100%</span>
                <span className="text-xs text-neutral-400">Compromisso</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="block text-3xl font-extrabold text-brand-red-light">Pronta Entrega</span>
                <span className="text-xs text-neutral-400">Em Materiais</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}