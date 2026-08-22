import Image from 'next/image';
import { historyData } from '../data/gallery';
import { CheckCircle2, Award, Sparkles, MapPin } from 'lucide-react';

export function About() {
  return (
    <section id="sobre" className="py-20 lg:py-28 bg-white border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LADO ESQUERDO: HISTÓRIA & PILARES (7 colunas) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-xs font-bold text-brand-red uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Quem Somos
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal-dark tracking-tight leading-[1.15]">
                {historyData.title}
              </h2>
            </div>

            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              {historyData.story.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* PILARES OPERACIONAIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {historyData.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#f8f9fa] border border-neutral-200/80 space-y-1 hover:border-brand-red/30 transition-colors"
                >
                  <div className="flex items-center gap-2 text-brand-charcoal-dark font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0" />
                    <span>{pillar.title}</span>
                  </div>
                  <p className="text-xs text-neutral-500 pl-6 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* LADO DIREITO: CARD INSTITUCIONAL COM LOGO (5 colunas) */}
          <div className="lg:col-span-5">
            <div className="relative bg-brand-charcoal-dark text-white rounded-3xl p-8 sm:p-10 overflow-hidden shadow-2xl border border-neutral-800 space-y-8">
              {/* Brilho Atmosférico */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-brand-red/20 blur-3xl pointer-events-none" />

              {/* Cabeçalho do Card com a Logo Oficial */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/20 bg-neutral-900 flex-shrink-0 shadow-sm">
                  <Image
                    src="/logo.jpg"
                    alt="Logo O Ponto do Gesso"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-brand-red-light uppercase block">
                    Tradição & Solidez
                  </span>
                  <h3 className="text-xl font-black text-white">
                    O Ponto do Gesso
                  </h3>
                </div>
              </div>

              {/* Texto de Compromisso */}
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed relative z-10">
                Oferecemos suporte técnico desde o cálculo paramétrico de consumo até o arremate fino no canteiro. A parceria ideal para gesseiros autônomos, construtoras e proprietários.
              </p>

              {/* Métricas e Garantias */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4 relative z-10">
                <div className="space-y-1">
                  <span className="block text-2xl sm:text-3xl font-black text-white">100%</span>
                  <span className="text-[11px] font-semibold text-neutral-400">Garantia Estrutural</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-2xl sm:text-3xl font-black text-brand-red-light">Imediato</span>
                  <span className="text-[11px] font-semibold text-neutral-400">Retirada no Balcão</span>
                </div>
              </div>

              {/* Rodapé do Card com Selo de Atendimento */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 relative z-10">
                <MapPin className="w-4 h-4 text-brand-red-light shrink-0" />
                <span className="text-xs text-neutral-300 font-medium">
                  Atendimento ágil para todo o estado
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}