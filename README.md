# O Ponto do Gesso - Landing Page Institucional & Comercial

Landing page moderna e de alta performance desenvolvida para **O Ponto do Gesso**, focada em captação de clientes para prestação de serviços (gesso, drywall, sancas) e venda direta de materiais para construção a pronta entrega.

---

## 🚀 Tecnologias Utilizadas

- **[Next.js](https://nextjs.org/)** (App Router & Server Components)
- **[React](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Lucide React](https://lucide.dev/)** (Ícones)

---

## 🎯 Principais Funcionalidades

- **Design Responsivo & Mobile-First:** Otimizado para conversão rápida via dispositivos móveis.
- **Identidade Visual Personalizada:** Paleta de cores integrada com a marca (Bordô/Vinho e Grafite).
- **Conversão Direta para WhatsApp:** CTAs dedicados para orçamentos de obras e consulta de catálogo de materiais.
- **SEO Otimizado:** Metadados estruturados para ranqueamento local e pré-visualização rica em redes sociais (OpenGraph).
- **Galeria de Projetos:** Exibição dinâmica de obras realizadas com filtros por categoria.
- **Centralização de Dados:** Informações de contato, serviços e catálogo isolados na camada `data/` para fácil manutenção.

---

## 📁 Estrutura do Projeto

```text
src/
└── app/
    ├── components/         # Componentes de seção (Header, Hero, Services, Gallery, etc.)
    ├── data/               # Arquivos de dados (company.ts, offerings.ts, gallery.ts)
    ├── globals.css         # Configurações de tema do Tailwind CSS v4
    ├── layout.tsx          # Configurações globais de SEO e fontes
    └── page.tsx            # Composição da Landing Page
public/                     # Imagens estáticas, logo e assets