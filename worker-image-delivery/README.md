# Worker de Image Delivery (Cloudflare Images Transformations)

Worker separado responsável apenas pela **entrega otimizada de imagens** ao
navegador. Ele **não** lida com upload/delete — essas responsabilidades
continuam no Worker `portfolio-arquitetura-r2`.

## Arquitetura

```
React
  → img.brunacamara-arq.com.br/<objectKey>?preset=<preset>
    → portfolio-image-delivery (este Worker)
      → Cloudflare Image Transformations (fetcht com cf.image)
        → images.brunacamara-arq.com.br (custom domain R2)
          → R2 bucket (originais, nunca modificados)
```

## Presets (whitelist fechada)

| Preset | Width | Quality | Formato |
|---|---|---|---|
| `thumbnail` | 500 | 78 | auto (AVIF/WebP) |
| `mobile` | 800 | 80 | auto |
| `tablet` | 1200 | 82 | auto |
| `gallery` | 1600 | 82 | auto |
| `hero` | 1920 | 84 | auto |
| `full` | 2560 | 88 | auto |
| `social` | 1200 | 85 | auto |

Todos os presets usam `fit: scale-down` (não ampliam imagens menores) e
`format: auto` (negociação AVIF/WebP com fallback).

## Segurança e custo

- O `preset` é obrigatório e precisa estar na whitelist — **nunca** são aceitos
  `width`/`height`/`quality` arbitrários.
- O `objectKey` é validado por regex (`projects/{id}/original/{uuid}.{ext}` e
  `heroes/{nome}.{ext}`). Não são aceitas URLs externas.
- Os originais do R2 **nunca** são modificados.
- Cada combinação (`objectKey` + `preset`) conta como 1 "unique transformation"
  por mês. Repetições saem do cache e não são cobradas.

## Deploy

```bash
cd worker-image-delivery
npm install
wrangler login
wrangler deploy
```

O Custom Domain `img.brunacamara-arq.com.br` é definido em `wrangler.jsonc`
(`routes` com `custom_domain: true`). O DNS e o certificado são criados
automaticamente pela Cloudflare.

## Variáveis / configuração

- `ORIGIN_BASE_URL` (var no `wrangler.jsonc`, padrão
  `https://images.brunacamara-arq.com.br`): origem dos originais no R2.
- No dashboard Cloudflare, é necessário:
  1. Habilitar **Image Transformations** na zona.
  2. Adicionar `images.brunacamara-arq.com.br` como **allowed origin** em
     *Images → Transformations → Sources* (porque a origem é um subdomínio
     diferente do domínio de entrega).

## Teste local

```bash
cd worker-image-delivery
wrangler dev --port 8788
curl "http://localhost:8788/heroes/Cena_01_v.png?preset=hero"
```