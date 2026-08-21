// src/components/FloatingWhatsApp.tsx
import { MessageCircle } from 'lucide-react';
import { companyData } from '../data/company';

export function FloatingWhatsApp() {
  const whatsappUrl = `https://wa.me/${companyData.whatsapp}?text=${encodeURIComponent(
    companyData.whatsappDefaultMessage
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-200"
    >
      <MessageCircle className="w-7 h-7 fill-current" />
    </a>
  );
}