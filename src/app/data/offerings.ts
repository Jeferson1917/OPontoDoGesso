// src/data/offerings.ts
import { 
  Sparkles, 
  Layers, 
  SquareAsterisk, 
  Maximize2, 
  Package, 
  Wrench, 
  Hammer, 
  Boxes 
} from 'lucide-react';

export const services = [
  {
    icon: Sparkles,
    title: 'Sancas e Iluminação',
    description: 'Sancas abertas, invertidas, ilhas centrais e rasgos de luz em LED com acabamento refinado para salas e quartos.',
    tag: 'Design & Acabamento',
  },

  {
    icon: Maximize2,
    title: 'Forros e Rebaixamento',
    description: 'Rebaixo de teto em gesso plaquinha ou acartonado estruturado, garantindo alinhamento e estética impecável.',
    tag: 'Estrutural',
  },
  {
    icon: SquareAsterisk,
    title: 'Revestimento 3D & Molduras',
    description: 'Painéis decorativos em gesso 3D, molduras de teto e frisos para modernizar paredes residenciais e comerciais.',
    tag: 'Decoração',
  },
];

export const products = [
  {
    category: 'Gesso em Pó',
    icon: Package,
    items: ['Gesso Lento para Revestimento', 'Gesso Rápido', 'Gesso de Fundição'],
    description: 'Sacos com alta pureza e secagem controlada para acabamentos finos e peças.',
  },
  {
    category: 'Perfis e Estruturas Metálicas',
    icon: Wrench,
    items: ['Montantes e Guias', 'Canaletas F530', 'Cantoneiras de Proteção e Tabicas'],
    description: 'Perfis galvanizados de alta resistência para sustentação de forros e paredes.',
  },
  {
    category: 'Acessórios e Ferramentas',
    icon: Hammer,
    items: ['Parafusos e Buchas', 'Fitas Teladas e Microperfuradas', 'Massa de Junta e Espátulas'],
    description: 'Tudo o que o profissional precisa para montagem e acabamento completo da obra.',
  },
];