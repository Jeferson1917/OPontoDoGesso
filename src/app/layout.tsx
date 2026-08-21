// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'O Ponto do Gesso | Serviços de Gesso e Venda de Materiais',
  description: 'Especialistas em forros, sancas iluminadas e venda completa de materiais e ferramentas para gesso.',
  keywords: ['gesso','sancas', 'forro de gesso', 'materiais para gesso', 'reforma'],
  openGraph: {
    title: 'O Ponto do Gesso | Serviços & Materiais',
    description: 'Forros, sancas e venda direta de insumos a pronta entrega.',
    url: 'https://opontodogesso.com.br',
    siteName: 'O Ponto do Gesso',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}