// src/app/components/Gallery.tsx
'use client';

import { useState } from 'react';
import { Camera, ArrowRight } from 'lucide-react';
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
    <section id="galeria" className="py-20 lg:py-28 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-sm font-bold tracking-wider text-brand-red uppercase">
              Nosso Portfólio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal-dark tracking-tight mt-2">
              Obras e Acabamentos Realizados
            </h2>
            <p className="text-neutral-600 mt-3 text-base sm:text-lg">
              Veja o padrão de entrega dos nossos projetos residenciais e comerciais.
            </p>
          </div>

          <a
            href={`https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
              'Olá! Gostaria de ver mais fotos de projetos realizados pela empresa.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors"
          >
            <span>Ver mais projetos no WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === cat
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Espaço para Imagem (com fallback visual) */}
              <div className="relative aspect-4/3 w-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                <Camera className="w-8 h-8 opacity-40 group-hover:scale-110 transition-transform duration-300" />
              </div>

              <div className="p-5">
                <span className="text-[11px] font-semibold tracking-wider text-brand-red uppercase">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-brand-charcoal-dark mt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}