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

Copie `.env.example` para `.env` e preencha:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_SITE_URL` | sim | URL pública do site (sem barra final), ex. `https://clientename.com.br` |
| `VITE_SUPABASE_URL` | sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | sim | Chave pública anon do Supabase |
| `VITE_EMAILJS_SERVICE_ID` | depende | Service ID do EmailJS (formulário) |
| `VITE_EMAILJS_TEMPLATE_ID` | depende | Template ID do EmailJS |
| `VITE_EMAILJS_PUBLIC_KEY` | depende | Public key do EmailJS |
| `VITE_IMG_BASE_URL` | sim | Base do Worker de image delivery (ex. `https://img.<dominio>.com.br`) |
| `VITE_R2_PUBLIC_URL` | fallback | Custom domain do bucket R2 |
| `VITE_ANALYTICS_ENDPOINT` | não | Endpoint do Worker de analytics (`/api/collect`) |
| `VITE_R2_UPLOAD_ENDPOINT` | admin | Endpoint do Worker de upload |
| `VITE_R2_DELETE_ENDPOINT` | admin | Endpoint do Worker de delete |

Server-side (NUNCA com prefixo `VITE_`, NUNCA no frontend — vão como **secrets**
no Cloudflare/GitHub): `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ADMIN_EMAIL`,
`SUPABASE_ADMIN_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CLOUDFLARE_API_TOKEN`.

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
5. Defina os **secrets** no Worker/R2 (ver seções abaixo).

## 3. Cloudflare R2 (por cliente)

1. Crie um **bucket R2** (ex.: `project-images`).
2. Crie um **Custom Domain** público (ex.: `images.<dominio>.com.br`) para servir os originais.
3. Gere `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` em **R2 → Manage R2 API Tokens**.
4. Configure os **secrets** do Worker de upload/delete:
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`,
   `ALLOWED_ORIGINS`, `SUPABASE_URL`.

Deploy do Worker de upload/delete:

```bash
cd worker
npm install
wrangler login
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put R2_BUCKET_NAME
wrangler secret put SUPABASE_URL
wrangler deploy
```

> Ajuste `ALLOWED_ORIGINS` em `worker/wrangler.jsonc` com o domínio do cliente.

## 4. Image Delivery (por cliente)

1. Crie o Worker em `worker-image-delivery/`.
2. Ajuste `wrangler.jsonc`: `ORIGIN_BASE_URL` (custom domain do bucket, ex.
   `https://images.<dominio>.com.br`) e o `pattern` do *Custom Domain* de entrega
   (ex. `img.<dominio>.com.br`).
3. Habilite **Image Transformations** na zona e adicione o custom domain dos
   originais como **allowed origin**.
4. Deploy:

```bash
cd worker-image-delivery
npm install
wrangler deploy
```

5. Defina `VITE_IMG_BASE_URL=https://img.<dominio>.com.br` no frontend.

## 5. Analytics (opcional, por cliente)

O Worker em `worker-analytics/` coleta sessões (privacy-first). Configure os
secrets `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` e as vars `ALLOWED_ORIGINS`
e `SITE_DOMAIN` (domínio do cliente) em `wrangler.jsonc`. Depois aponte
`VITE_ANALYTICS_ENDPOINT` para o endpoint publicado.

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
2. Defina os **secrets** do repositório (Settings → Secrets and variables → Actions):
   `VITE_SITE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_EMAILJS_*`, `VITE_IMG_BASE_URL`,
   `VITE_R2_PUBLIC_URL`, `VITE_ANALYTICS_ENDPOINT`, `VITE_R2_UPLOAD_ENDPOINT`,
   `VITE_R2_DELETE_ENDPOINT`, `CLOUDFLARE_API_TOKEN`.
3. Se usar domínio custom, atualize `public/CNAME` e o DNS (registro CNAME).

## 8. Deploy

O workflow `.github/workflows/deploy.yml` roda no push para `main` e faz:
build → sitemap → pré-renderização SEO → copy 404 → deploy GitHub Pages, e em
paralelo o deploy dos Workers (R2 capa e image delivery).

```bash
git push origin main
```

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

Para que o formulário funcione também em produção, defina estes valores como secrets no repositório GitHub:

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

No GitHub, vá em Settings → Secrets and variables → Actions e adicione os valores. O workflow já passa esses secrets para o build do Vite.

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
