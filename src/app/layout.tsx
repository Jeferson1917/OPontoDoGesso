// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { companyData } from './data/company';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(companyData.siteUrl),
  title: 'O Ponto do Gesso | Serviços de Gesso e Venda de Materiais em Aracaju',
  description: 'Forros, sancas iluminadas, molduras e revestimento em gesso em Aracaju-SE, e venda de materiais para gesso a pronta entrega.',
  keywords: ['gesso', 'gesso Aracaju', 'sancas', 'forro de gesso', 'materiais para gesso', 'reforma'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'O Ponto do Gesso | Serviços & Materiais',
    description: 'Forros, sancas e venda direta de insumos a pronta entrega em Aracaju-SE.',
    url: '/',
    siteName: 'O Ponto do Gesso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/logo.jpg', width: 640, height: 641, alt: 'Logo O Ponto do Gesso' }],
  },
  twitter: { card: 'summary', images: ['/logo.jpg'] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {children}
        <Toaster richColors position="top-right" theme="light" /> 
      </body>
    </html>
  );
}