// src/app/components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { companyData } from '../data/company';
import { Lock, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-charcoal-dark text-white border-t border-white/10 relative overflow-hidden">
      {/* Luz sutil de fundo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-brand-red/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 relative z-10">
        
        {/* PARTE SUPERIOR DO FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">

          {/* Coluna 1: Identidade & Logo (5 colunas) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 flex-shrink-0 shadow-sm">
                <Image
                  src="/logo.jpg"
                  alt="Logo O Ponto do Gesso"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white uppercase">
                  O Ponto do <span className="text-brand-red-light">Gesso</span>
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  Forros, Sancas & Insumos a Pronta Entrega
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Referência em fornecimento de materiais e execução de acabamentos em gesso tradicional para obras residenciais e comerciais.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos de Navegação (4 colunas) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Navegação Rápida
            </span>
            <ul className="grid grid-cols-2 gap-2.5 text-xs text-neutral-400">
              {companyData.navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="text-neutral-500 hover:text-brand-red-light transition-colors inline-flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Área Restrita
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento Direto (3 colunas) */}
          <div className="md:col-span-3 space-y-3 md:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Atendimento Comercial
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Solicitações de propostas de obras ou pedidos no balcão via WhatsApp.
            </p>
            <a
              href={`https://wa.me/${companyData.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red-light hover:underline mt-1"
            >
              <span>Falar com o Galpão</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* LINHA DE DIREITOS AUTORAIS */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {currentYear} {companyData.name}. Todos os direitos reservados.</p>
          <p className="text-[11px] text-neutral-400">
            Qualidade, alinhamento técnico e acabamento fino.
          </p>
        </div>

      </div>
    </footer>
  );
}