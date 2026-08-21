// src/components/Products.tsx
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { products } from '../data/offerings';
import { companyData } from '../data/company';

export function Products() {
  return (
    <section id="materiais" className="py-20 lg:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-sm font-bold tracking-wider text-brand-red uppercase">
              Loja & Distribuição
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal-dark tracking-tight mt-2">
              Materiais a Pronta Entrega para sua Obra
            </h2>
            <p className="text-neutral-600 mt-3 text-base sm:text-lg">
              Fornecemos insumos de alta qualidade para gesseiros, construtoras e clientes finais com preços competitivos.
            </p>
          </div>

          <a
            href={`https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
              'Olá! Gostaria de consultar preços de materiais no atacado/varejo.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-brand-charcoal-dark hover:bg-neutral-900 text-white font-semibold px-5 py-3 rounded-xl shadow-sm transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Consultar Balcão de Vendas</span>
          </a>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {products.map((prod, index) => {
            const Icon = prod.icon;
            return (
              <div
                key={index}
                className="flex flex-col justify-between p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-brand-charcoal-dark">
                    {prod.category}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 mb-4">
                    {prod.description}
                  </p>

                  <ul className="space-y-2 border-t border-neutral-200/80 pt-4">
                    {prod.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}