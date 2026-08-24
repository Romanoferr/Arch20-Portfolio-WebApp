# Worker Cloudflare — Capa segura para Cloudflare R2

Este Worker é a **única** camada que tem acesso às credenciais R2
(`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`). O frontend React **nunca** deve
ter acesso a elas.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/upload` | Valida sessão Supabase e retorna uma presigned URL `PUT` para R2 |
| `DELETE` | `/api/delete` | Valida sessão Supabase e elimina um objeto de R2 |

## Variáveis de ambiente (secrets do Worker)

Defina como **secrets** no Cloudflare Dashboard ou via `wrangler secret put`:

```bash
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put R2_BUCKET_NAME
wrangler secret put SUPABASE_JWT_SECRET
```

A variável `ALLOWED_ORIGIN` é definida em `wrangler.jsonc` (origem permitida
para CORS), mas pode ser sobrescrita como secret se preferir.

> **Nota:** `SUPABASE_URL` **não** é necessária no Worker. A validação do JWT é
> feita localmente com `SUPABASE_JWT_SECRET` (HS256), sem chamar o Supabase.

## Fluxo de upload

```
Admin (frontend)
   → POST /api/upload  { projectId, filename, contentType }
        (Authorization: Bearer <JWT Supabase>)
   → Worker valida o JWT e retorna { objectKey, uploadUrl }
   → Frontend faz PUT no R2 usando uploadUrl
   → Se PUT OK → registra metadata no Supabase (project_images)
```

## Fluxo de delete

```
Admin (frontend)
   → DELETE /api/delete  { objectKey }
     (Authorization: Bearer <JWT Supabase>)
   → Worker valida o JWT, gera presigned DELETE e remove o objeto no R2
```

## Segurança

- **Nunca** exponha `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` ao cliente.
- O Worker valida o **JWT de Supabase** (HS256) e a **expiração** antes de
  conceder qualquer operação.
- `SUPABASE_JWT_SECRET` deve ser o **JWT Secret** do Supabase (equivalenta à
  chave que assina os tokens de sessão).