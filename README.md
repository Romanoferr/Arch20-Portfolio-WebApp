# Template — Portfólio de Arquitetura

Template reutilizável de site de portfólio profissional para escritórios de
arquitetura, desenvolvido com React, Vite e TypeScript.

Use este template para criar novos sites de clientes (`architecture-portfolio-client01`,
`architecture-portfolio-client02`, etc.), cada um com seu próprio repositório,
Supabase, R2, Workers e domínio.

## 1. Como criar um novo site a partir deste template

1. **Crie um novo repositório** no GitHub (`Use this template` ou copie esta branch).
2. **Clone** e rode `npm install`.
3. Copie `.env.example` para `.env` e preencha com os dados do novo cliente
   (veja a seção [Variáveis de ambiente](#variáveis-de-ambiente)).
4. Crie o **Supabase** da instância e aplique as migrations
   (`supabase/migrations/`).
5. Crie o **bucket R2** e faça deploy dos **Workers** (upload/delete, analytics,
   image delivery).
6. Personalize `src/config/` (nome, contato, SEO), as cores em
   `src/styles/index.css` e substitua as imagens.
7. Configure o **GitHub Pages** e o domínio custom (veja a seção Deploy).

> **Importante:** este template NÃO contém dados, credenciais, domínio ou
> imagens de nenhum cliente específico. Toda a configuração específica fica em
> `src/config/` e nas variáveis de ambiente.

## Tecnologias

- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** v4
- **React Router** — navegação entre páginas
- **Framer Motion** — animações sutis
- **Lucide React** — ícones
- **React Hook Form** — formulário de contato
- **EmailJS** — envio de e-mail sem backend

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Build para produção

```bash
npm run build
npm run preview
```

## Autenticação com Supabase

Para habilitar o acesso administrativo, crie um arquivo .env com as variáveis abaixo:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-publica>
```

### Passos no painel do Supabase

1. Crie um projeto no Supabase.
2. Acesse Settings → API e copie a Project URL e a anon public key.
3. Acesse Authentication → Settings e habilite o provedor Email.
4. Defina as Redirect URLs para:
   - http://localhost:5173/admin/login
   - https://<seu-dominio>/admin/login
5. Crie o primeiro usuário administrativo em Authentication → Users.
6. Acesse /admin/login para entrar.

## Persistência de projetos (Database + Storage)

Os projetos são armazenados no Supabase em duas tabelas (`projects` e `project_images`)
e as imagens ficam no bucket público `project-images` do Storage.

### Configuração inicial (uma vez)

Antes de usar o CRUD de projetos, execute a migration que cria as tabelas, índices,
RLS, policies e o bucket:

- **Opção A — SQL Editor:** abra o arquivo
  `supabase/migrations/0001_projects.sql`, copie todo o conteúdo e cole no
  **SQL Editor** do dashboard do Supabase, depois clique em **Run**.
- **Opção B — CLI:** com o Supabase CLI instalado e o projeto vinculado
  (`supabase link`), rode `supabase db push`.

A migration cria:

- Tabela `projects` (id uuid, slug, title, category, year, location, area,
  description, published, order, created_at, updated_at).
- Tabela `project_images` (id uuid, project_id FK com `on delete cascade`,
  storage_path, is_cover, display_order, created_at).
- Índices (slug único, published, order, project_id, uma capa por projeto).
- Trigger de `updated_at`.
- **RLS**: leitura pública; escrita (insert/update/delete) apenas para usuários
  autenticados — em ambas as tabelas.
- Bucket público `project-images` + policies de Storage (leitura pública;
  upload/update/delete apenas autenticado).

> **Importante:** nenhuma chave secreta (`service_role`) é usada no frontend.
> Apenas a `anon key` pública é necessária.

### Estrutura de armazenamento das imagens

As imagens são enviadas para `project-images/projects/{project_id}/{arquivo}`.
O registro correspondente fica em `project_images` com `storage_path`, `is_cover`
e `display_order`.

## Otimização e entrega de imagens (Cloudflare Images + R2)

### Arquitetura

```
React
  → getImageUrl(objectKey, preset)
    → img.seu-dominio.com.br/<objectKey>?preset=<preset>
      → Image Delivery Worker (portfolio-image-delivery)
        → Cloudflare Image Transformations (cf.image)
          → images.seu-dominio.com.br (custom domain R2)
            → R2 bucket (originais, nunca modificados)
```

- Os **originais** ficam no R2 (`projects/{projectId}/original/{uuid}.{ext}` e
  `heroes/*`) e **nunca** são modificados.
- O navegador **não** acessa os originais diretamente: toda imagem passa pelo
  Worker de image delivery, que aplica resize/compressão/transcodificação sob
  demanda e cacheia a variante na edge.

### Presets (whitelist fechada)

| Preset | Width | Quality | Uso |
|---|---|---|---|
| `thumbnail` | 500 | 78 | Cards da galeria, previews admin |
| `mobile` | 800 | 80 | Telas até 800px |
| `tablet` | 1200 | 82 | Telas médias |
| `gallery` | 1600 | 82 | Imagem principal de projeto |
| `hero` | 1920 | 84 | Hero / capa full-width |
| `full` | 2560 | 88 | Alta resolução (tela cheia) — **não usar por padrão** |
| `social` | 1200 | 85 | og:image / JSON-LD / compartilhamento |

Todos usam `format: auto` (AVIF/WebP com fallback) e `fit: scale-down` (não
ampliam imagens menores). A lista é **fechada** — nunca gerar combinações
arbitrárias de `width`/`height`/`quality`, para preservar cache e custo.

### Formato de URL

```
https://img.seu-dominio.com.br/<objectKey>?preset=<preset>
```

Ex.: `https://img.seu-dominio.com.br/projects/123/original/abc.jpg?preset=gallery`

### Abstração central

Todo acesso a imagem passa por `getImageUrl(objectKey, preset)` em
`src/lib/r2/config.ts` (reexportado por `src/lib/r2`). Helpers de `srcset`/
`sizes` responsivos estão em `src/utils/imageUrl.ts` (`buildSrcSet`, `imageUrl`,
`GALLERY_PRESETS`, `FULL_WIDTH_PRESETS`).

### Cache

- As variantes transformadas são cacheadas automaticamente pela Cloudflare por
  combinação (objectKey + preset).
- O Worker define `Cache-Control: public, max-age=31536000, immutable` (originais
  são UUIDs/nomes estáticos).
- URLs são determinísticas: mesma imagem + mesmo preset = mesma URL.

### Configuração Cloudflare (dashboard)

1. Habilitar **Image Transformations** na zona `seu-dominio.com.br`
   (*Images → Transformations*).
2. Adicionar `images.seu-dominio.com.br` como **allowed origin** em
   *Images → Transformations → Sources* (a origem é um subdomínio diferente do
   domínio de entrega).
3. Deploy do Worker `portfolio-image-delivery` e conectar o **Custom Domain**
   `img.seu-dominio.com.br` (DNS/certificado automáticos).

### Variáveis de ambiente

- `VITE_IMG_BASE_URL=https://img.seu-dominio.com.br` — base do Worker de
  entrega (usada pelo frontend para todas as imagens).
- `VITE_R2_PUBLIC_URL=https://images.seu-dominio.com.br` — origem dos
  originais (fallback legado / origem do Worker).

### Deploy do Worker de entrega

```bash
cd worker-image-delivery
npm install
wrangler login
wrangler deploy
```

### Como adicionar um novo preset

1. Adicione a entrada em `worker-image-delivery/index.js` (`PRESETS`).
2. Adicione a entrada em `src/lib/r2/presets.ts` (`IMAGE_PRESETS`).
3. Use `getImageUrl(objectKey, 'novoPreset')` no componente.

### Como testar

```bash
npm test          # testes unitários (URLs, presets, segurança do Worker)
npm run build     # typecheck + build
```

### Como diagnosticar uma imagem lenta

1. Abra a URL da imagem no navegador e verifique o `Cache-Control`/status.
2. Verifique se a combinação (objectKey + preset) já foi transformada
   (primeira requisição = cache miss; seguintes = cache hit).
3. Confirme que `images.seu-dominio.com.br` está como allowed origin.
4. Verifique o custo/limite de transformações em *Images → Transformations*.

## Variáveis de ambiente

Copie `.env.example` para `.env` (dev local). Em produção, os valores são
fornecidos ao pipeline como **GitHub Variables** (públicas) ou **GitHub
Secrets** (sensíveis). Veja a seção [Automação de deploy](#9-deploy-automático).

### GitHub Variables (públicas — vão ao bundle do frontend `VITE_*`)

| Variável | Coluna | Descrição |
|---|---|---|
| `VITE_SITE_URL` | requerida | URL pública do site (sem barra final) |
| `VITE_SUPABASE_URL` | requerida | URL do projeto Supabase (pública, vai ao bundle) |
| `VITE_SUPABASE_ANON_KEY` | requerida | Chave pública anon (vai ao bundle) |
| `VITE_EMAILJS_SERVICE_ID` | opcional | Service ID do EmailJS |
| `VITE_EMAILJS_TEMPLATE_ID` | opcional | Template ID do EmailJS |
| `VITE_EMAILJS_PUBLIC_KEY` | opcional | Public key do EmailJS |
| `VITE_R2_PUBLIC_URL` | fallback | Custom domain do bucket R2 (origens) |
| `VITE_IMG_BASE_URL` | requerida | Base do Worker de image delivery |
| `VITE_ANALYTICS_ENDPOINT` | opcional | Endpoint do Worker de analytics (`/api/collect`) |
| `VITE_R2_UPLOAD_ENDPOINT` | admin | Endpoint do Worker de upload |
| `VITE_R2_DELETE_ENDPOINT` | admin | Endpoint do Worker de delete |
| `VITE_BASE_PATH` | opcional | Base path do GitHub Pages (ex.: `/repo/`) |
| `SITE_URL_FRONTEND` | recomendada | Mesmo valor de `VITE_SITE_URL`; usada nas `ALLOWED_ORIGINS` dos Workers |
| `IMG_DELIVERY_DOMAIN` | image-delivery | Custom domain de entrega (ex.: `img.<dominio>.com.br`) |

### GitHub Secrets (sensíveis — NUNCA no bundle, só nos Workers)

| Variável | Worker | Descrição |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | todos | Token Cloudflare (escopo Workers/R2) |
| `SUPABASE_SERVICE_ROLE_KEY` | analytics/upload | Chave service_role (NUNCA no frontend) |
| `SUPABASE_URL` | analytics/upload | URL do projeto (server-side, igual a `VITE_SUPABASE_URL`) |
| `R2_ACCOUNT_ID` | upload | Account ID Cloudflare |
| `R2_ACCESS_KEY_ID` | upload | Access key R2 |
| `R2_SECRET_ACCESS_KEY` | upload | Secret key R2 |
| `R2_BUCKET_NAME` | upload | Nome do bucket R2 |

**Regras de ouro:**
- `VITE_*` → públicas (vão ao bundle) → **GitHub Variables**.
- credenciais/keys (`CLOUDFLARE_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `R2_*`)
  → **GitHub Secrets** → injetados nos Workers via `wrangler --secrets-file`.
- Nunca transforme secret em `VITE_*`.

## 2. Supabase (por cliente)

1. Crie um projeto novo no Supabase.
2. Aplique as migrations em `supabase/migrations/` (**0001** projetos, **0002–0004**
   analytics) via **SQL Editor** ou `supabase db push`. Elas criam tabelas, índices,
   RLS, RPCs e o bucket `project-images`.
3. Em **Authentication → Settings**, habilite o provedor Email e defina as
   **Redirect URLs**:
   - `http://localhost:5173/admin/login`
   - `https://<seu-dominio>/admin/login`
4. Crie o primeiro usuário administrador em **Authentication → Users**.
5. Configure `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_URL` como **GitHub Secrets**
   — o pipeline os injeta nos Workers de analytics/upload via `--secrets-file`.

> Criar o projeto, aplicar migrations e criar o bucket permanecem **manuais**
> (dashboard/CLI). O deploy NÃO faz provisionamento de banco.

## 3. Cloudflare R2 (por cliente)

1. Crie um **bucket R2** (ex.: `project-images`).
2. Crie um **Custom Domain** público (ex.: `images.<dominio>.com.br`) para servir os originais.
3. Gere `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` em **R2 → Manage R2 API Tokens**.
4. Configure como **GitHub Secrets**: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `SUPABASE_URL` — o pipeline os
   injeta no Worker de upload/delete via `--secrets-file`.

Etapa **manual** (única): criar o bucket e o custom domain no dashboard. O
pipeline apenas faz o deploy do Worker com os secrets.

## 4. Image Delivery (por cliente)

1. Garanta **Image Transformations** habilitada na zona e o custom domain dos
   originais como **allowed origin** (etapa manual no dashboard).
2. Configure as **GitHub Variables**:
   - `ORIGIN_BASE_URL` **ou** `VITE_R2_PUBLIC_URL`: custom domain do bucket R2,
     ex. `https://images.<dominio>.com.br`.
   - `IMG_DELIVERY_DOMAIN`: custom domain de entrega, ex. `img.<dominio>.com.br`.
3. `git push origin main` → o pipeline executa
   `wrangler deploy --var ORIGIN_BASE_URL=... --domain <img-domínio>`.

> **Fallback local:** 
> ```bash
> cd worker-image-delivery
> npm install
> wrangler deploy --var ORIGIN_BASE_URL:https://images.<dominio>.com.br --domain img.<dominio>.com.br
> ```

## 5. Analytics (opcional, por cliente)

O Worker em `worker-analytics/` coleta sessões (privacy-first). É deployado
**apenas se** o secret `SUPABASE_SERVICE_ROLE_KEY` estiver configurado no GitHub
(condição `if:` no workflow).

- **GitHub Secrets:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **GitHub Variables:** `SITE_DOMAIN` (ou derivada de `SITE_URL_FRONTEND`), e
  `ALLOWED_ORIGINS` derivada de `SITE_URL_FRONTEND`.

Depois aponte `VITE_ANALYTICS_ENDPOINT` (Variable) para o endpoint publicado.

## 6. Personalização

> **Regra geral:** a **identidade do cliente** (nome, contato, redes, endereço,
> SEO) fica **só** em `src/config/`. O **conteúdo** editável do site (serviços,
> depoimentos, links do menu) fica em `src/data/`. Não duplique dados de
> identidade em mais de um lugar — edite `siteConfig` e o restante se reflete
> automaticamente.

### Identidade e contato

Edite `src/config/site.ts` (`siteConfig`): nome, tagline, e-mail, telefone,
WhatsApp, redes sociais e endereço. Campos vazios omitem o respectivo elemento
(ex.: botão de WhatsApp se `contact.whatsapp` estiver vazio, link do Instagram
se `social.instagram` estiver vazio).

### SEO

Edite `src/config/seo.ts` (função `createSeoConfig`): URL pública do site,
nome, descrição, locale.

### Conteúdo editável (`src/data/`)

- `services.ts` — serviços prestados.
- `testimonials.ts` — depoimentos.
- `navigation.ts` — links do menu (`navLinks`).

### Cores e tipografia

Edite as variáveis em `src/styles/index.css` (`@theme`):

```css
--color-bg: #fafaf8;
--color-accent: #8b7355;
/* ... */
```

### Imagens

- **Heroes:** substitua os object keys em `src/lib/r2/config.ts` (`HERO_OBJECT_KEYS`)
  e faça upload das imagens para o bucket em `heroes/`.
- **Logo/favicons:** coloque os novos em `public/` e remova os placeholders.
- **Projetos:** faça upload via painel Admin (`/admin`).

### Textos institucionais

- `Sobre` → `src/pages/Sobre/Sobre.tsx` (conteúdo institucional do escritório).
- Depoimentos → `src/data/testimonials.ts`.
- Serviços → `src/data/services.ts`.

## 7. GitHub Pages (por cliente)

1. Vá em **Settings → Pages** do repositório → fonte: *GitHub Actions*.
2. Crie o domínio custom no Pages e atualize `public/CNAME` com o domínio
   (o pipeline não altera o CNAME automaticamente) e o DNS (registro CNAME).
3. Se o site não estiver na raiz de um repositório `<login>.github.io`, defina
   a Variable `VITE_BASE_PATH` (ex.: `/nome-do-repo/`).

## 8. Deploy

O workflow `.github/workflows/deploy.yml` roda no push para `main` e faz:

```
git push origin main
   └─ build           (frontend com VITE_* de GitHub Variables)
       ├─ sitemap + prerender SEO
       ├─ copy 404     (fallback SPA)
       └─ upload artifact → GitHub Pages
   ├─ deploy-worker                   (upload/delete — vars + secrets)
   ├─ deploy-image-delivery-worker     (vars: ORIGIN_BASE_URL + --domain)
   └─ deploy-analytics-worker          (opcional, se service_role configurado)
```

## 9. Deploy automático (CI/CD)

### Como funciona

O `deploy.yml` usa `wrangler v4` com duas flags que mantêm secrets fora do
código:

- **Vars** (`wrangler deploy --var KEY:VALUE`): valores públicos por-cliente
  (origens permitidas, domínio do site, origem R2). Vêm de **GitHub Variables**.
- **Secrets** (`wrangler deploy --secrets-file <arquivo>`): credenciais
  (R2, service_role). Um passo monta um arquivo `.env` temporário a partir dos
  **GitHub Secrets** via `scripts/write-worker-secrets.mjs` — que **nunca imprime
  valores** — e o wrangler o consome. O arquivo é descartado e gitignored.

Isso é a **Opção C** (mais segura): secrets não ficam no `wrangler.jsonc` nem em
`VITE_*`; são enviados diretamente ao Worker via CLI em cada deploy.

### Por que não `--secrets-file` + vars no `wrangler.jsonc`

Antes, os secrets R2/Supabase eram configurados manualmente no dashboard e o
deploy preservava-os. Isso exigia abrir o Cloudflare a cada cliente. Agora o
pipeline os injeta automaticamente a partir do GitHub, removendo a etapa manual.

### Flags importantes

- `--keep-vars`: se você definir vars manualmente no dashboard, considere
  adicioná-la no comando para não apagá-las no deploy (por padrão o wrangler
  limpa as vars antes de aplicar as declaradas). No template as vars vêm todas
  do CI, então o padrão já é determinístico.
- `--secrets-file` é **aditivo**: secrets não declarados no arquivo não são
  removidos do Worker anterior.

### Etapas ainda manuais (por cliente)

| Etapa | Onde | Motivo |
|---|---|---|
| Criar projeto Supabase + aplicar migrations | Supabase | Provisionamento de banco (fora do escopo do CI) |
| Criar usuário admin | Supabase Auth | Credenciais do admin |
| Criar bucket R2 + custom domain | Cloudflare R2 | Provisionamento de storage |
| Habilitar Image Transformations + allowed origin | Cloudflare Images | Config de zona (dashboard) |
| Apontar DNS do domínio (CNAME) | Provedor DNS | DNS externo |
| Configurar GitHub Secrets/Variables | GitHub | Dados do ambiente do cliente |

## Estrutura do projeto

```
src/
├── assets/          # Imagens e logos
├── components/      # Navbar, Hero, Footer, Gallery, etc.
├── config/          # Identidade do cliente (site.ts) e SEO (seo.ts)
├── pages/           # Home, Projetos, Serviços, Sobre, Contato
├── data/            # Conteúdo editável (navegação, serviços, depoimentos)
├── hooks/           # useMediaQuery, useScrollToTop, useProjects
├── utils/           # Helpers e animações
└── styles/          # CSS global e tema
```

> **Dica:** a identidade/contato do cliente ficam **só** em `src/config/site.ts`.
> O conteúdo editável (serviços, depoimentos, links do menu) fica em `src/data/`.

### Formulário de contato (EmailJS)

O formulário já está integrado com o EmailJS, então o processo é:

1. Crie uma conta em [emailjs.com](https://www.emailjs.com/)
2. No painel, adicione um Serviço de E-mail (por exemplo, Gmail, Outlook ou outro provedor configurado)
3. Crie um Template de e-mail com os campos abaixo:
   - `from_name` — nome da pessoa que enviou a mensagem
   - `from_email` — e-mail do remetente
   - `phone` — telefone informado
   - `message` — conteúdo da mensagem
4. Copie os valores de:
   - `Service ID`
   - `Template ID`
   - `Public Key`
5. Crie o arquivo `.env` com base no exemplo abaixo e preencha os valores:

```env
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID=seu_template_id
VITE_EMAILJS_PUBLIC_KEY=sua_public_key
```

6. Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

7. Teste o formulário no navegador e confirme se a mensagem chega ao e-mail configurado.

### Deploy no GitHub Pages

Para que o formulário funcione em produção, defina estes valores como **GitHub
Variables** no repositório (são públicos e vão ao bundle):

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

No GitHub, vá em *Settings → Secrets and variables → Actions → Variables* e
adicione os valores. O workflow já passa essas vars para o build do Vite.

> O template do EmailJS deve usar exatamente os nomes das variáveis `from_name`, `from_email`, `phone` e `message` para que o envio funcione corretamente.

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Home com hero, projetos em destaque e serviços |
| `/projetos` | Galeria completa com filtros por categoria |
| `/projetos/:slug` | Detalhe de um projeto |
| `/servicos` | Serviços prestados e processo de trabalho |
| `/sobre` | Apresentação do estúdio |
| `/contato` | Formulário e informações de contato |

## Licença

Projeto privado — Template de portfólio de arquitetura.
