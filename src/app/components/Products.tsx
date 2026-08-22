import { CheckCircle2, MessageCircle, Package, ArrowUpRight, Truck, ShieldAlert } from 'lucide-react';
import { products } from '../data/offerings';
import { companyData } from '../data/company';

export function Products() {
  const whatsappBalcaoUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    'Olá! Gostaria de consultar a disponibilidade e valores para retirada no balcão.'
  )}`;

  return (
    <section id="materiais" className="py-20 lg:py-28 bg-white border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* CABEÇALHO DA SEÇÃO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-xs font-bold text-brand-red uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" /> Balcão & Distribuição Direta
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal-dark tracking-tight leading-[1.15]">
              Insumos de qualidade a pronta entrega.
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
              Atendemos gesseiros, montadores, construtoras e proprietários com insumos secos e certificados, prontos para carregar no galpão.
            </p>
          </div>

          <a
            href={whatsappBalcaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-brand-charcoal-dark hover:bg-neutral-900 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Consultar Balcão de Vendas</span>
          </a>
        </div>

        {/* GRID DE PRODUTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod, index) => {
            const Icon = prod.icon;
            const whatsappCategoryUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
              `Olá! Gostaria de consultar preços e quantidades disponíveis para ${prod.category}.`
            )}`;

            return (
              <div
                key={index}
                className="group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-[#f8f9fa] border border-neutral-200/80 hover:bg-white hover:border-brand-red/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="space-y-5">
                  {/* Topo do Card */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white text-brand-red border border-neutral-200/60 shadow-sm flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Em Estoque
                    </span>
                  </div>

                  {/* Informações */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-brand-charcoal-dark tracking-tight">
                      {prod.category}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Lista de Itens Inclusos */}
                  <div className="pt-3 border-t border-neutral-200/60 space-y-2">
                    {prod.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-red shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Link de Pedido Rápido */}
                <a
                  href={whatsappCategoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs font-bold text-neutral-600 group-hover:text-brand-red transition-colors"
                >
                  <span>Pedir cotação rápida</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {/* BOX INFORMATIVO DE ATACADO / CARRETA FECHADA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white border border-neutral-200 text-brand-charcoal-dark shrink-0">
              <Truck className="w-5 h-5 text-brand-red" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-brand-charcoal-dark">Cargas Fechadas para Revenda</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Fornecimento programado de gesso em pó e placas com precificação diferenciada para depósitos e grandes obras.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white border border-neutral-200 text-brand-charcoal-dark shrink-0">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-brand-charcoal-dark">Armazenamento Seco & Protegido</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Pátio coberto e estrado suspenso para evitar umidade, garantindo a pega perfeita e sem empedramento.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}