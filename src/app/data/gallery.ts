// src/app/data/gallery.ts
// Para mostrar uma foto: coloque o arquivo em public/images/ com o nome indicado em `image`
// (ex.: public/images/galeria-1.jpg). Enquanto o arquivo não existir, o card mostra "Foto em Atualização".
export interface GalleryItem {
  title: string;
  category: string;
  description: string;
  image: string | null;
}

export const galleryItems: GalleryItem[] = [
  {
    title: 'Sanca Invertida com LED',
    category: 'Sancas & Iluminação',
    description: 'Iluminação indireta suave em sala de estar.',
    image: '/images/galeria-1.jpg',
  },
  {
    title: 'Parede em Gesso 3D',
    category: 'Revestimento 3D',
    description: 'Efeito volumétrico elegante em painel de TV.',
    image: '/images/galeria-3.jpg',
  },
  {
    title: 'Forro com Cortineiro Embutido',
    category: 'Forros e Rebaixo',
    description: 'Acabamento minimalista integrado à cortina.',
    image: '/images/galeria-4.jpg',
  },
];

export const historyData = {
  foundedYear: '2015', // Ajuste para o ano real de início
  title: 'Compromisso com a Qualidade em Cada Detalhe',
  story: [
    'Fundada com o propósito de oferecer serviços de excelência e suprir a demanda por materiais confiáveis, O Ponto do Gesso consolidou-se como referência no mercado de acabamentos e gesso.',
    'Trabalhamos com mão de obra altamente qualificada, rigoroso cumprimento de prazos e venda direta dos melhores insumos para quem constrói ou reforma.',
  ],
  pillars: [
    { title: 'Pontualidade Rigorosa', desc: 'Início e término de obras conforme o cronograma acordado.' },
    { title: 'Acabamento Fino', desc: 'Atenção aos cantos, lixamento e alinhamento impecável.' },
    { title: 'Estoque Próprio', desc: 'Agilidade no fornecimento sem atrasar a sua construção.' },
  ],
};