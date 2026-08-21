// src/app/page.tsx
import { Header } from './components/header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Products } from './components/Products';
import { Gallery } from './components/Gallery';
import { About } from './components/About';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 pt-20">
      <Header />

      <main className="flex-1 flex flex-col">
        <Hero />
        <Services />
        <Products />
        <Gallery />
        <About />

        {/* Última Seção: Contato & Rodapé */}
        <section id="contato" className="py-24 px-4 max-w-7xl mx-auto w-full">
          <p className="text-neutral-500 font-medium text-center">[Seção Contato: Endereço, mapa e horários]</p>
        </section>
      </main>

      <FloatingWhatsApp />
    </div>
  );
}