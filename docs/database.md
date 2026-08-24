# Banco de Dados — Supabase (PostgreSQL)

## Visão

O Supabase continua responsável por PostgreSQL, Auth e metadata. O banco não
armazena URLs de imagens completas — apenas uma **object key relativa**
em `project_images.storage_path`. Essa chave é usada com `getImageUrl()` no
frontend para montar a URL final (atualmente apontando para o Cloudflare R2).

## Tabelas

### `projects`

| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| slug | text unique | |
| title | text | |
| category | text | check residencial/comercial/interiores |
| year | integer | |
| location / area | text | |
| description | text | |
| published | boolean | default true |
| order | integer | default 999 |
| created_at / updated_at | timestamptz | trigger updated_at |

### `project_images`

| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| project_id | uuid FK → projects (on delete cascade) | |
| storage_path | text not null | **object key relativa** (ex.: `projects/{id}/original/{uuid}.png`) |
| is_cover | boolean | default false |
| display_order | integer | default 0 |
| created_at | timestamptz | |

> A coluna `storage_path` já era uma chave relativa, o que favoreceu a
> migração para R2: não foi preciso alterar o schema para armazenar a nova
> chave. O valor passou a ser a object key do R2 após a migração.

## Relacionamentos

- `projects 1 ── N project_images`
- Deleção de projeto remove imagens via `on delete cascade`.

## Row Level Security (RLS)

- `select` público (imagens/ projetos publicáveis).
- `insert` / `update` / `delete` apenas para `authenticated` (admin).
- Policies de Storage antigas: permanecem enquanto o bucket do Supabase não é
  removido (fase de coexistência).

## Migração R2

A migração não altera o schema. Ela atualiza `project_images.storage_path` de
`projects/{id}/{uuid}.png` para `projects/{id}/original/{id-imagem}.png`
(object key R2). Veja `scripts/migrate-to-r2.mjs` e
[`docs/migracao-r2.md`](migracao-r2.md).