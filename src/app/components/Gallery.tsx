'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, ArrowRight, Sparkles, Eye } from 'lucide-react';
import { galleryItems } from '../data/gallery';
import { companyData } from '../data/company';

export function Gallery() {
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(galleryItems.map((item) => item.category)))];

  const filteredItems =
    selectedFilter === 'Todos'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedFilter);

  return (
    <section id="galeria" className="py-20 lg:py-28 bg-[#f8f9fa] border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* CABEÇALHO DA SEÇÃO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-xs font-bold text-brand-red uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Nosso Portfólio
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal-dark tracking-tight leading-[1.15]">
              Obras & acabamentos entregues.
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
              Confira os detalhes de alinhamento, iluminação embutida e acabamento fino em projetos reais.
            </p>
          </div>

          <a
            href={`https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
              'Olá! Gostei das fotos da galeria e gostaria de solicitar um orçamento para meu imóvel.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-red hover:text-brand-red-dark bg-white border border-neutral-200/80 hover:border-brand-red px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all self-start md:self-end shrink-0"
          >
            <span>Ver mais projetos no WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* FILTROS DINÂMICOS */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedFilter === cat
                  ? 'bg-brand-charcoal-dark text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:text-brand-charcoal-dark hover:bg-neutral-100 border border-neutral-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE CARDS COM SUPORTE A FOTO REAL OU PLACEHOLDER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item: any, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* ÁREA DA FOTO */}
              <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-gradient-to-b from-neutral-100 to-neutral-200/80 gap-2">
                    <Camera className="w-8 h-8 opacity-40 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Foto em Atualização
                    </span>
                  </div>
                )}

                {/* Badge Flutuante da Categoria */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-charcoal-dark/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* CONTEÚDO DESCRITIVO */}
              <div className="p-5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-brand-charcoal-dark tracking-tight group-hover:text-brand-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-neutral-400 group-hover:text-brand-charcoal-dark transition-colors">
                  <span>Padrão O Ponto do Gesso</span>
                  <Eye className="w-3.5 h-3.5 text-brand-red" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}