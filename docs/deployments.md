# Deploy e Configuração do Cloudflare Worker

## Deploy do Worker (capa R2)

A pasta `worker/` contém o código do Cloudflare Worker que protege as
credenciais R2. Para publicá-lo:

**Opção A — Wrangler CLI (recomendada):**
```bash
cd worker
npm i -g wrangler
wrangler login
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put R2_BUCKET_NAME
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_JWT_SECRET
wrangler deploy
```

**Opção B — Dashboard:** colar `worker/index.js` no editor do Worker e
adicionar as secrets em *Settings → Variables and Secrets*.

### CORS / ALLOWED_ORIGIN

Defina `ALLOWED_ORIGIN` (no `wrangler.jsonc` ou como secret) para o domínio do
site, ex.: `https://exemplo.com.br`. Durante o desenvolvimento local,
pode usar `http://localhost:5173`.

## URL pública R2

- O bucket R2 usa um **custom domain** ativo: `https://images.exemplo.com.br`.
- Configure `VITE_R2_PUBLIC_URL` para esse domínio no `.env`.

## Site estático (GitHub Pages)

O site é uma SPA desplegada como antes. As variáveis VITE usadas no frontend
são injetadas no build (`.env` local). Garanta no CI/deploy que estas estão
presentes:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_R2_PUBLIC_URL
VITE_R2_UPLOAD_ENDPOINT
VITE_R2_DELETE_ENDPOINT
```