// src/app/data/company.ts

export const companyData = {
  name: "O Ponto do Gesso",
  tagline: "Excelência em serviços e venda de materiais para gesso",
  siteUrl: "https://opontodogesso.com.br",
  phone: "(79) 99811-3110",
  whatsapp: "5579998113110", // Apenas números: DDI + DDD + Número
  email: "contato@opontodogesso.com.br",
  address: "Rua Valdice Braz de Jesús, número 34, bairro São Conrado, Aracaju-SE, CEP 49042-439",
  // Mesmo endereço, em partes, para os dados estruturados do Google (empresa local)
  addressParts: {
    street: "Rua Valdice Braz de Jesús, 34 - São Conrado",
    city: "Aracaju",
    state: "SE",
    postalCode: "49042-439",
    country: "BR",
  },
  // Horário em formato schema.org (o texto de "hours" é o que aparece no site)
  openingHours: ["Mo-Fr 07:30-17:00", "Sa 07:30-12:00"],
  city: "Aracaju - SE",
  hours: "Seg a Sex: 07:30 às 17:00 | Sáb: 07:30 às 12:00",
  instagram: "https://instagram.com/opontodogesso",
  whatsappDefaultMessage: "Olá! Gostaria de tirar dúvidas sobre serviços e materiais de gesso.",
  navLinks: [
    { name: "Início", href: "#hero" },
    { name: "Serviços", href: "#servicos" },
    { name: "Materiais", href: "#materiais" },
    { name: "Galeria", href: "#galeria" },
    { name: "Quem Somos", href: "#sobre" },
    { name: "Contato", href: "#contato" },
  ],
};