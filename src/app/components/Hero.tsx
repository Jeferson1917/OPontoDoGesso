import Image from 'next/image';
import { 
  ShieldCheck, 
  Clock, 
  Hammer, 
  ShoppingCart, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import { companyData } from '../data/company';

export function Hero() {
  const whatsappObraUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Gostaria de solicitar um orçamento para serviço de gesso em meu imóvel.'
  )}`;

  const whatsappMaterialUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Gostaria de consultar preços e disponibilidade de materiais de gesso a pronta entrega.'
  )}`;

  const stats = [
    {
      icon: Hammer,
      title: 'Mão de Obra Especializada',
      desc: 'Nivelamento a laser e acabamento fino sem trincas.',
    },
    {
      icon: ShoppingCart,
      title: 'Materiais a Pronta Entrega',
      desc: 'Placas 60x60, gesso em pó, sisal e molduras no galpão.',
    },
    {
      icon: Clock,
      title: 'Compromisso com Prazos',
      desc: 'Cronograma rigoroso da montagem ao desmolde.',
    },
    {
      icon: ShieldCheck,
      title: 'Garantia Estrutural',
      desc: 'Fixação reforçada com arame galvanizado e chumbamento.',
    },
  ];

  return (
    <section id="hero" className="relative bg-brand-charcoal-dark text-white overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Luzes de Fundo Atmosféricas */}
      <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-brand-red/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-brand-red/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* GRID PRINCIPAL: 2 COLUNAS (TEXTO + SHOWCASE CARD) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Coluna da Esquerda: Copy & CTAs (7 colunas) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Badge de Autoridade */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-neutral-200 backdrop-blur-md shadow-inner">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span className="font-semibold text-neutral-300">Referência em Gesso Tradicional & Insumos</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              O acabamento fino que sua obra exige, com a{' '}
              <span className="bg-gradient-to-r from-rose-400 via-brand-red-light to-brand-red bg-clip-text text-transparent">
                confiança de quem fabrica.
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Especialistas em forro plaquinha 60x60, sancas estruturadas, molduras finas e revestimento liso. Fornecemos tanto a execução completa quanto insumos a pronta entrega no galpão.
            </p>

            {/* Ações / Botões */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href={whatsappObraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold px-7 py-4 rounded-2xl shadow-xl shadow-brand-red/25 hover:shadow-brand-red/40 hover:-translate-y-0.5 transition-all text-sm sm:text-base group"
              >
                <span>Solicitar Orçamento de Obra</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={whatsappMaterialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 hover:border-white/30 font-semibold px-6 py-4 rounded-2xl backdrop-blur-sm transition-all text-sm sm:text-base"
              >
                <ShoppingCart className="w-4 h-4 text-neutral-400" />
                <span>Consultar Materiais no Galpão</span>
              </a>
            </div>

            {/* Micro-prova social */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Atendimento Direto com Especialista</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Proposta Técnica Detalhada em PDF</span>
              </div>
            </div>

          </div>

          {/* Coluna da Direita: Showcase Card com Identidade Visual (5 colunas) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              
              {/* Topo do Card com Logo */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 flex-shrink-0">
                    <Image
                      src="/logo.jpg"
                      alt="Logo O Ponto do Gesso"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">O Ponto do Gesso</h3>
                    <p className="text-[11px] text-neutral-400">Padrão Construtivo Superior</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 100% Alinhado
                </span>
              </div>

              {/* Destaques Técnicos da Execução */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-neutral-300">Gesso Tradicional de Alta Pureza</span>
                  <span className="font-bold text-white">Secagem Uniforme</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-neutral-300">Fixação Estruturada</span>
                  <span className="font-bold text-white">Arame nº 18 + Sisal</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-neutral-300">Acabamento e Arremate</span>
                  <span className="font-bold text-brand-red-light">Zero Ondulações</span>
                </div>
              </div>

              {/* Bloco de Atendimento Rápido */}
              <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/20 space-y-1">
                <span className="text-[11px] font-bold text-brand-red-light uppercase tracking-wider block">
                  Pronta Entrega no Galpão
                </span>
                <p className="text-xs text-neutral-300 leading-snug">
                  Retirada direta de placas 60x60, sacos de gesso e insumos para gesseiros e construtores.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* 4 CARDS INFERIORES DE DIFERENCIAIS (GRID RESPONSIVO) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/10">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-brand-red/40 transition-all duration-300 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-charcoal border border-white/10 flex items-center justify-center text-brand-red-light group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-100 text-sm">{item.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}