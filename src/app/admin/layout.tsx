import type { Metadata } from 'next';

// Páginas do painel nunca devem ser indexadas
export const metadata: Metadata = {
  title: 'Painel | O Ponto do Gesso',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
