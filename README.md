# Estúdio Forma — Portfólio de Arquitetura

Site responsivo de portfólio para arquitetura, desenvolvido com React, Vite e TypeScript.

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
    → img.brunacamara-arq.com.br/<objectKey>?preset=<preset>
      → Image Delivery Worker (portfolio-image-delivery)
        → Cloudflare Image Transformations (cf.image)
          → images.brunacamara-arq.com.br (custom domain R2)
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
https://img.brunacamara-arq.com.br/<objectKey>?preset=<preset>
```

Ex.: `https://img.brunacamara-arq.com.br/projects/123/original/abc.jpg?preset=gallery`

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

1. Habilitar **Image Transformations** na zona `brunacamara-arq.com.br`
   (*Images → Transformations*).
2. Adicionar `images.brunacamara-arq.com.br` como **allowed origin** em
   *Images → Transformations → Sources* (a origem é um subdomínio diferente do
   domínio de entrega).
3. Deploy do Worker `portfolio-image-delivery` e conectar o **Custom Domain**
   `img.brunacamara-arq.com.br` (DNS/certificado automáticos).

### Variáveis de ambiente

- `VITE_IMG_BASE_URL=https://img.brunacamara-arq.com.br` — base do Worker de
  entrega (usada pelo frontend para todas as imagens).
- `VITE_R2_PUBLIC_URL=https://images.brunacamara-arq.com.br` — origem dos
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
3. Confirme que `images.brunacamara-arq.com.br` está como allowed origin.
4. Verifique o custo/limite de transformações em *Images → Transformations*.

## Estrutura do projeto

```
src/
├── assets/          # Imagens e logos
├── components/      # Navbar, Hero, Footer, Gallery, etc.
├── pages/           # Home, Projetos, Serviços, Sobre, Contato
├── data/            # Conteúdo (projetos, serviços, depoimentos)
├── hooks/           # useMediaQuery, useScrollToTop, useProjects
├── utils/           # Helpers e animações
└── styles/          # CSS global e tema
```

## Personalização

### Conteúdo

Edite os arquivos em `src/data/`:

- `projects.ts` — projetos do portfólio
- `services.ts` — serviços prestados
- `testimonials.ts` — depoimentos de clientes
- `navigation.ts` — links do menu e informações de contato

### Imagens

Substitua as URLs do Unsplash por suas próprias imagens em `src/assets/imagens/` e atualize os caminhos nos arquivos de dados.

### Cores e tipografia

Ajuste as variáveis CSS em `src/styles/index.css`:

```css
--color-bg: #fafaf8;
--color-accent: #8b7355;
/* ... */
```

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

Projeto privado — Estúdio Forma.
