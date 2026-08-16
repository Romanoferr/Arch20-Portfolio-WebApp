import type { Project, ProjectCategory } from '@/types/project'

export const SITE_URL = 'https://brunacamara-arq.com.br'
export const SITE_NAME = 'Bruna Câmara | Arquitetura e Design de Interiores'
export const SITE_NAME_SHORT = 'Bruna Câmara'
export const SITE_DESCRIPTION =
  'Bruna Câmara, arquiteta no Rio de Janeiro e Niterói. Projetos de arquitetura residencial, comercial e design de interiores personalizados.'
export const LOCALE = 'pt_BR'
export const OG_IMAGE = `${SITE_URL}/images/og-image.jpg`
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_ALT =
  'Bruna Câmara — Arquitetura e Design de Interiores no Rio de Janeiro e Niterói'
export const TWITTER_HANDLE = '@brunacamara.arq'

/** Informações de contato e localização (usadas em SEO local e JSON-LD). */
export const CONTACT = {
  email: 'camarabruna.arq@gmail.com',
  telephone: '+5521985330175',
  instagram: 'https://instagram.com/brunacamara.arq',
  city: 'Rio de Janeiro',
  state: 'RJ',
  country: 'BR',
  areaServed: ['Rio de Janeiro', 'Niterói'],
  geo: {
    latitude: -22.9068,
    longitude: -43.1729,
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
    title: 'Bruna Câmara | Arquiteta Rio de Janeiro — Arquitetura e Design de Interiores',
    description:
      'Bruna Câmara, arquiteta no Rio de Janeiro e Niterói. Projetos de arquitetura residencial, comercial e design de interiores. Solicite seu orçamento.',
    canonical: SITE_URL,
  },
  projetos: {
    title: 'Portfólio de Arquitetura | Bruna Câmara — Projetos no Rio de Janeiro',
    description:
      'Conheça o portfólio de arquitetura de Bruna Câmara: projetos residenciais, comerciais e de interiores realizados no Rio de Janeiro e Niterói.',
    canonical: `${SITE_URL}/projetos`,
  },
  servicos: {
    title: 'Serviços de Arquitetura | Bruna Câmara — Arquiteta Rio de Janeiro',
    description:
      'Serviços de arquitetura residencial, comercial, design de interiores, reformas, paisagismo e consultoria no Rio de Janeiro e Niterói.',
    canonical: `${SITE_URL}/servicos`,
  },
  sobre: {
    title: 'Sobre | Bruna Câmara — Arquiteta e Urbanista no Rio de Janeiro',
    description:
      'Arquiteta e Urbanista formada pela UFRJ, especialista em Design de Interiores. Conheça minha trajetória e filosofia de trabalho.',
    canonical: `${SITE_URL}/sobre`,
  },
  contato: {
    title: 'Contato | Bruna Câmara — Arquiteta no Rio de Janeiro e Niterói',
    description:
      'Entre em contato com a arquiteta Bruna Câmara para solicitar um orçamento ou tirar dúvidas sobre projetos de arquitetura no Rio de Janeiro e Niterói.',
    canonical: `${SITE_URL}/contato`,
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
    title: `${project.title} | Bruna Câmara — Projeto de Arquitetura ${category}`,
    description: truncateAtWord(project.description, 155),
    canonical: `${SITE_URL}/projetos/${project.slug}`,
    ogType: 'article',
    ogImage: project.coverImage,
  }
}