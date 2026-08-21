// src/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone } from 'lucide-react';
import { companyData } from '../data/company';

export function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const whatsappUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
        companyData.whatsappDefaultMessage
    )}`;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                {/* Logo da Marca */}

                <Link href="#hero" className="flex items-center gap-3">
                    <Image
                        src="/logo.jpg"
                        alt="Logo O Ponto do Gesso"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                        priority
                    />
                    <div className="flex flex-col leading-tight">
                        <span className="text-lg font-bold tracking-wider text-brand-charcoal-dark uppercase">
                            O Ponto do <span className="text-brand-red">Gesso</span>
                        </span>
                        <span className="text-[11px] font-medium tracking-wide text-neutral-500">
                            Serviços & Materiais
                        </span>
                    </div>
                </Link>

                {/* Links Desktop */}
                <nav className="hidden md:flex items-center gap-8">
                    {companyData.navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-neutral-600 hover:text-brand-red transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Botão de Ação Rápida */}
                <div className="hidden md:flex items-center">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
                    >
                        <Phone className="w-4 h-4" />
                        <span>Falar no WhatsApp</span>
                    </a>
                </div>

                {/* Botão Mobile */}
                <div className="flex md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-neutral-700 hover:text-brand-red focus:outline-none"
                        aria-label="Abrir menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Menu Mobile */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
                    {companyData.navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block text-base font-medium text-neutral-700 hover:text-brand-red py-2"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-brand-red hover:bg-brand-red-dark text-white text-center font-medium py-3 rounded-lg mt-4 shadow-sm"
                    >
                        <Phone className="w-4 h-4" />
                        <span>Falar no WhatsApp</span>
                    </a>
                </div>
            )}
        </header>
    );
}