// src/app/components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { companyData } from '../data/company';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-brand-charcoal-dark text-white border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-between">

                    {/* Trecho da logo no Footer.tsx */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-1 flex items-center justify-center">
                            <Image
                                src="/logo.jpg"
                                alt="Logo O Ponto do Gesso"
                                width={40}
                                height={40}
                                className="h-10 w-10 object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold uppercase tracking-wider text-white">
                                O Ponto do <span className="text-brand-red-light">Gesso</span>
                            </span>
                            <span className="text-xs text-neutral-400">
                                Serviços & Materiais para Construção
                            </span>
                        </div>
                    </div>

                    {/* Links de Rodapé */}
                    <div className="flex flex-wrap gap-6 md:justify-center">
                        {companyData.navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-xs text-neutral-400 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Direitos Autorais */}
                    <div className="text-xs text-neutral-400 md:text-right">
                        <p>© {currentYear} {companyData.name}.</p>
                        <p className="mt-0.5">Todos os direitos reservados.</p>
                    </div>

                </div>
            </div>
        </footer>
    );
}