# Migração Supabase Storage → Cloudflare R2

Guia operacional da migração de armazenamento de imagens.

## Objetivo

Transferir as imagens do bucket público `project-images` (Supabase Storage)
para um bucket **Cloudflare R2**, reduzindo custo de egress/storage, mantendo
o site e o módulo Admin funcionais.

## Arquitetura resultante

```
Admin → Cloudflare Worker (presigned URL, valida JWT) → R2 → Supabase metadata
React → getImageUrl(objectKey) → R2/CDN → visitante
```

## Componentes

| Item | Local |
|---|---|
| Worker (capa segura) | `worker/index.js` (+ `worker/wrangler.jsonc`, `worker/README.md`) |
| Camada de URL no frontend | `src/lib/r2/config.ts`, `src/lib/r2/index.ts` |
| Serviço de projetos (upload/delete) | `src/services/projectsService.ts` |
| Helpers de otimização | `src/utils/imageUrl.ts` |
| Script de migração | `scripts/migrate-to-r2.mjs` |

## Como migrar

### 1. Pré-requisitos

- Bucket R2 criado (público, ex.: `arch20-portfolio-images`).
- API token R2 (Access Key + Secret Key) e `R2_ACCOUNT_ID`.
- Variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`).
- `@aws-sdk/client-s3` instalado (devDependency).

### 2. Executar a migração

```bash
node scripts/migrate-to-r2.mjs
```

O script:
1. Lista todos os projetos.
2. Para cada `project_images`, baixa a imagem do Supabase Storage.
3. Envia para o R2 em `projects/{projectId}/original/{imageId}.{ext}`.
4. Atualiza `project_images.storage_path` com a nova object key R2.
5. **Não apaga** os arquivos do Supabase (fase de coexistência).

### 3. Verificar a migração

Faça uma consulta no banco e compare totais:

```sql
-- Total de imagens no banco
select count(*) from project_images;

-- Quantas já apontam para R2 (object keys com o prefixo novo)
select count(*) from project_images
where storage_path like 'projects/%/original/%';
```

No console do R2 (Dashboard) o número de objetos deve bater com o total de
`project_images`.

### 4. Repetir/reexecutar

O script é **idempotente**: se um objeto `{projectId}/original/{imageId}.{ext}`
já estiver no R2, ele não re-downloada; apenas re-sincroniza o `storage_path`
no banco. Segunda execução não gera duplicados.

### 5. Rollback

Caso algo dê errado antes da remoção do Supabase Storage:

1. Pare de usar R2.
2. Reverter `project_images.storage_path` para o valor original do Supabase
   (paths `projects/{id}/{uuid}.png`). Recomenda-se ter um dump/backup do banco
   antes da migração.
3. No frontend, usar novamente o Supabase (config antiga). Como toda URL passa
   por `getImageUrl()`, basta ajustar `VITE_R2_PUBLIC_URL`/config.

> Nunca remova o Supabase Storage até confirmar (a) todas as imagens migradas,
> (b) Admin consegue upload/delete, (c) front carrega via R2.

### 6. Remover o Supabase Storage (fase final)

Somente após validação completa:

1. Confirme `total banco == objetos no R2`.
2. Faça HEAD request / validação nas URLs públicas.
3. Remova as policies de Storage do Supabase (opcional) e/ou esvazie o bucket.
4. Atualize a URL pública final do R2 (custom domain se aplicável).

---

## Segurança

- As chaves R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) **nunca** no
  frontend. Vivem apenas no Worker/secrets do Cloudflare.
- O Worker valida o JWT Supabase (Bearer) antes de gerar presigned URLs.
- URLs públicas do R2 expõem somente imagem (bucket público).
- Não são colocadas credenciais em `src/` com prefixo `VITE_`.

## Variáveis de ambiente

| Variável | Escopo | Uso |
|---|---|---|
| `VITE_R2_PUBLIC_URL` | Frontend | Base da URL pública de leitura |
| `VITE_R2_UPLOAD_ENDPOINT` | Frontend | URL do endpoint do Worker para upload |
| `VITE_R2_DELETE_ENDPOINT` | Frontend | URL do endpoint do Worker para delete |
| `R2_ACCOUNT_ID` | server-side | Conta Cloudflare |
| `R2_ACCESS_KEY_ID` | server-side | Access Key R2 |
| `R2_SECRET_ACCESS_KEY` | server-side | Secret Key R2 |
| `R2_BUCKET_NAME` | server-side | Nome do bucket |
| `SUPABASE_JWT_SECRET` | server-side | Para validar JWT no Worker |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | server-side | Scripts/migração |