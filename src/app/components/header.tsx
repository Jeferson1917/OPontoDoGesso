'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, Lock } from 'lucide-react';
import { companyData } from '../data/company';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    companyData.whatsappDefaultMessage
  )}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* IDENTIDADE / LOGO */}
        <Link href="#hero" className="flex items-center gap-3.5 group">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border border-neutral-200 shadow-xs flex-shrink-0 bg-neutral-900 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.jpg"
              alt="Logo O Ponto do Gesso"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base sm:text-lg font-black tracking-tight text-brand-charcoal-dark uppercase">
              O Ponto do <span className="text-brand-red">Gesso</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-neutral-400">
              Forros & Distribuição de Insumos
            </span>
          </div>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden md:flex items-center gap-7">
          {companyData.navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs sm:text-sm font-bold text-neutral-600 hover:text-brand-red transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/admin"
            className="text-xs font-bold text-neutral-400 hover:text-brand-charcoal-dark transition-colors inline-flex items-center gap-1 pl-2 border-l border-neutral-200"
          >
            <Lock className="w-3.5 h-3.5" /> Admin
          </Link>
        </nav>

        {/* BOTÃO DE CONTATO DESKTOP */}
        <div className="hidden md:flex items-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>

        {/* BOTÃO DO MENU MOBILE */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:text-brand-red transition-colors"
            aria-label="Alternar Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MENU MOBILE */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200/80 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {companyData.navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-bold text-neutral-800 hover:text-brand-red py-2.5 border-b border-neutral-100"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-brand-charcoal-dark py-2.5"
            >
              <Lock className="w-4 h-4 text-brand-red" /> Acessar Painel Admin
            </Link>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3.5 rounded-xl shadow-sm text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Chamar no WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
}