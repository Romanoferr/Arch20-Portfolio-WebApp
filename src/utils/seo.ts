import type { Project, ProjectCategory } from '@/types/project'
import { getImageUrl } from '@/lib/r2'
import { siteConfig } from '@/config/site'
import { createSeoConfig } from '@/config/seo'

/**
 * Configuração central de SEO.
 *
 * TODO (por cliente): definir a URL pública do site (sem barra final) e os
 * textos padrão. Os textos das páginas podem ser ajustados em `pageSeo`.
 */
const seo = createSeoConfig({
  siteUrl: 'https://site-exemplo.com.br',
  siteName: siteConfig.name,
  siteNameFull: siteConfig.name,
  description: siteConfig.description,
  locale: 'pt_BR',
})

export const SITE_URL = seo.siteUrl
export const SITE_NAME = seo.siteNameFull
export const SITE_NAME_SHORT = seo.siteName
export const SITE_DESCRIPTION = seo.description
export const LOCALE = seo.locale
export const OG_IMAGE = seo.ogImage
export const OG_IMAGE_WIDTH = seo.ogImageWidth
export const OG_IMAGE_HEIGHT = seo.ogImageHeight
export const OG_IMAGE_ALT = seo.ogImageAlt
export const TWITTER_HANDLE = seo.twitterHandle

/** Informações de contato e localização (usadas em SEO local e JSON-LD). */
export const CONTACT = {
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.whatsapp || siteConfig.contact.phone,
  instagram: siteConfig.social.instagram || '',
  city: siteConfig.address.city,
  state: siteConfig.address.state,
  country: siteConfig.address.country,
  areaServed: [siteConfig.address.city],
  geo: {
    latitude: 0,
    longitude: 0,
  },
}

export interface SeoProps {
  title: string
  description: string
  canonical?: string
  ogType?: 'website' | 'article'
  ogImage?: string
  noIndex?: boolean
}

export const pageSeo: Record<string, SeoProps> = {
  home: {
    title: `${siteConfig.name} | Arquitetura e Design de Interiores`,
    description: SITE_DESCRIPTION,
    canonical: SITE_URL,
  },
  projetos: {
    title: `Portfólio de Arquitetura | ${siteConfig.name} — Projetos`,
    description:
      'Conheça o portfólio de arquitetura e design de interiores com projetos residenciais e comerciais.',
    canonical: `${SITE_URL}/projetos/`,
  },
  servicos: {
    title: `Serviços de Arquitetura | ${siteConfig.name}`,
    description:
      'Serviços de arquitetura residencial, comercial, design de interiores, reformas e consultoria.',
    canonical: `${SITE_URL}/servicos/`,
  },
  sobre: {
    title: `Sobre | ${siteConfig.name} — Arquitetura`,
    description:
      'Conheça a trajetória do escritório de arquitetura e sua filosofia de trabalho.',
    canonical: `${SITE_URL}/sobre/`,
  },
  contato: {
    title: `Contato | ${siteConfig.name}`,
    description:
      'Entre em contato para solicitar um orçamento ou tirar dúvidas sobre projetos de arquitetura.',
    canonical: `${SITE_URL}/contato/`,
  },
}

const categoryLabels: Record<ProjectCategory, string> = {
  residencial: 'residencial',
  comercial: 'comercial',
  interiores: 'interiores',
}

/** Trunca um texto em um limite de caracteres sem cortar palavras no meio. */
function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`
}

export function getProjectSeo(project: Project): SeoProps {
  const category = categoryLabels[project.category]
  return {
    title: `${project.title} | ${siteConfig.name} — Projeto de Arquitetura ${category}`,
    description: truncateAtWord(project.description, 155),
    canonical: `${SITE_URL}/projetos/${project.slug}/`,
    ogType: 'article',
    ogImage: project.coverImageStorage
      ? getImageUrl(project.coverImageStorage, 'social')
      : project.coverImage,
  }
}