import { siteConfig } from './site'

export interface SeoParams {
  /** URL base do site público (ex.: https://cliente.com.br). Sem barra final. */
  siteUrl: string
  /** Nome curto exibido em og:site_name. */
  siteName?: string
  /** Nome completo usado em títulos/JSON-LD. */
  siteNameFull?: string
  /** Descrição padrão da home. */
  description?: string
  /** Locale (ex.: 'pt_BR'). */
  locale?: string
  /** handle Twitter (opcional, ex.: '@cliente'). */
  twitterHandle?: string
  /** Texto alternativo padrão da OG image. */
  ogImageAlt?: string
}

/**
 * Configuração de SEO centralizada.
 *
 * TODO (por cliente): preencher `siteUrl` e ajustar os textos padrão que
 * hoje derivam de `siteConfig`. O domínio nunca deve ficar hardcoded no
 * código; ele é controlado por `siteUrl` aqui e injetado em `index.html`
 * pelos scripts de pré-renderização.
 */
export function createSeoConfig(params: SeoParams) {
  const {
    siteUrl,
    siteName = siteConfig.name,
    siteNameFull = siteConfig.name,
    description = siteConfig.description,
    locale = 'pt_BR',
    twitterHandle = '',
    ogImageAlt = `${siteConfig.name} — Arquitetura`,
  } = params

  return {
    siteUrl,
    siteName,
    siteNameFull,
    description,
    locale,
    twitterHandle,
    ogImageAlt,
    ogImage: `${siteUrl}/images/og-image.jpg`,
    ogImageWidth: 1200,
    ogImageHeight: 630,
  }
}