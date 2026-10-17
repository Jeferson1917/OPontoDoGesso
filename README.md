# O Ponto do Gesso

Site institucional e sistema de gestão da **O Ponto do Gesso** (Aracaju-SE): uma landing page para captar clientes de serviços de gesso e de venda de materiais, e um painel administrativo para orçamentos, estoque, vendas no balcão e acompanhamento financeiro.

---

## Tecnologias

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| UI | React 19, Tailwind CSS 4, Lucide, Recharts, Sonner |
| Banco | PostgreSQL (Neon) via Prisma 6 |
| Autenticação | JWT (`jose`) em cookie httpOnly |
| Validação | zod 4 |
| PDF | jsPDF + jspdf-autotable |
| Testes | Vitest 4 · CI no GitHub Actions |

Node.js **20.9 ou superior**.

---

## Como rodar

```bash
npm ci
cp .env.example .env          # DATABASE_URL
cp .env.example .env.local    # AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npx prisma generate
npm run dev                   # http://localhost:3000  ·  painel em /admin
```

### Variáveis de ambiente

| Variável | Onde | Para quê |
|---|---|---|
| `DATABASE_URL` | `.env` | Conexão com o PostgreSQL (Neon). Também é lida pelo Prisma CLI. |
| `AUTH_SECRET` | `.env.local` | Assina o cookie de sessão. **Obrigatória, mínimo 32 caracteres** — sem ela o painel não funciona. Gere com `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `.env.local` | Login do painel. |

Na hospedagem (ex.: Vercel), cadastre as quatro variáveis nas configurações do projeto.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem gerar arquivos |
| `npm test` | Testes (Vitest) |

---

## Banco de dados

O schema fica em [`prisma/schema.prisma`](prisma/schema.prisma). O projeto **não usa migrations**: mudanças são aplicadas com `prisma db push`.

```bash
# 1. Ver exatamente o SQL que será aplicado (não altera nada)
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script

# 2. Aplicar
npx prisma db push
```

Sempre confira o passo 1 antes: o `db push` aplica qualquer diferença entre o schema e o banco. Se ele pedir `--accept-data-loss`, faça um backup antes de aceitar.

| Tabela | Conteúdo |
|---|---|
| `quotes` | Orçamentos: cômodos (`roomsData`), materiais calculados (`materialsSnapshot`), o que foi baixado do estoque (`stockMovement`), status e data de aprovação |
| `stock_balances` | Saldo, custo médio e preço de balcão de cada item |
| `truck_deliveries` | Cargas de caminhão recebidas |
| `counter_sales` | Vendas no balcão |
| `pricing_configs` | Tabela de preços (linha única `global_config`) |

Valores em dinheiro são `DECIMAL` no banco; a extensão em [`src/lib/prisma.ts`](src/lib/prisma.ts) os converte para `number` no código. Em `aggregate` e `$queryRaw` use `toNumber()`, e ao devolver linhas do banco numa Server Action use `toPlain()`.

---

## Painel administrativo (`/admin`)

Todas as páginas e Server Actions do painel verificam a sessão (`src/lib/auth.ts`); o login bloqueia o IP por 15 minutos após 5 tentativas erradas.

| Página | O que faz |
|---|---|
| **Dashboard** `/admin` | Faturamento, propostas, estoque de gesso, vendas no balcão e gráficos dos últimos 6 meses |
| **Orçamento** `/admin/orcamento` | Monta o orçamento por cômodo e serviço, permite negociar o valor, salva e gera PDF |
| **Histórico** `/admin/historico` | Lista os orçamentos e muda o status da obra |
| **Estoque** `/admin/estoque` | Saldo dos itens, entrada de caminhão e venda no balcão |
| **Balcão** `/admin/balcao` | Histórico das vendas no balcão |
| **Preços** `/admin/precos` | Mão de obra, custo dos insumos, margem, quebra e preço mínimo |

### Regras de negócio

- **Cálculo do orçamento** ([`quoteEngine.ts`](src/app/utils/quoteEngine.ts)): materiais e mão de obra por serviço; preço sugerido = (materiais + mão de obra) × margem, respeitando o preço mínimo. Revestimento de parede usa perímetro × altura da parede.
- **Baixa de estoque**: ao aprovar uma obra (APROVADO, EM_EXECUCAO ou CONCLUIDO), o estoque desconta **exatamente as quantidades do orçamento/PDF** e grava o que saiu em `stockMovement`. Se faltar material, a aprovação é recusada e a tela mostra o que falta. Ao cancelar ou voltar a pendente, devolve exatamente o que saiu.
- **Venda no balcão**: só conclui se houver saldo; vendas simultâneas não deixam o estoque negativo.
- **Carga de caminhão**: frete e descarga são rateados entre gesso e placas pelo valor das notas; o custo médio de cada item é atualizado por média ponderada.
- **Tabela de preços**: fica no banco (igual em todos os dispositivos). A tela mostra ao lado de cada insumo o custo médio real do estoque, com opção de usá-lo.
- **Dashboard**: lucro das obras = valor fechado − (mão de obra + materiais do orçamento); a receita entra no mês da aprovação.

---

## Landing page

Seções em [`src/app/components`](src/app/components); textos e contatos centralizados em [`src/app/data`](src/app/data) (`company.ts`, `offerings.ts`, `gallery.ts`).

**Fotos da galeria:** coloque os arquivos em `public/images/` com os nomes indicados em [`gallery.ts`](src/app/data/gallery.ts) (ex.: `galeria-1.jpg`), de preferência com até ~300 KB cada. Enquanto um arquivo não existir, o card mostra "Foto em Atualização".

---

## Estrutura

```text
src/
├── app/
│   ├── actions/        # Server Actions (orçamentos, estoque, preços, login)
│   ├── admin/          # Painel; telas grandes divididas em _components/
│   ├── components/     # Seções da landing page
│   ├── data/           # Tipos, schemas zod, tabela de preços padrão, itens do estoque, textos
│   ├── utils/          # Regras de negócio puras (orçamento, estoque, rateio, dashboard, PDF) + testes
│   ├── layout.tsx
│   └── page.tsx        # Landing page
├── lib/                # Prisma, sessão (JWT), autenticação, limite de tentativas de login
└── proxy.ts            # Redireciona /admin para o login sem sessão válida
prisma/schema.prisma
```

---

## Fluxo de trabalho

1. Cada tarefa vira uma **issue** e uma branch a partir da `developer`.
2. **PR para a `developer`**: a CI roda lint, typecheck, testes e build; só faz merge com tudo verde.
3. Depois de testar tudo junto na `developer`, PR da `developer` para a `main`.

---

## Problemas comuns

- **`Can't reach database server` ou `Timed out fetching a new connection` em desenvolvimento**: em algumas redes o IPv6 não alcança o Neon e as conexões falham de forma intermitente. Teste com `Test-NetConnection <host-do-neon> -Port 5432` (PowerShell). Se for isso, desative o IPv6 no adaptador de rede ou use outra rede; aumentar a tolerância também ajuda: acrescente `&connect_timeout=15&pool_timeout=30` à `DATABASE_URL`.
- **`AUTH_SECRET ausente ou com menos de 32 caracteres`**: defina a variável (veja acima).
- **`EPERM` ao rodar `prisma db push` ou `prisma generate` no Windows**: pare o `npm run dev` antes (ele trava o arquivo do Prisma Client).
