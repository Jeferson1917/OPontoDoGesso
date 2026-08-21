// src/app/page.tsx
import { Header } from './components/header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Products } from './components/Products';
import { Gallery } from './components/Gallery';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
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
        <Contact />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}