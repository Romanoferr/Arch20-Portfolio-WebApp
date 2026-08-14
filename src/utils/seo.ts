import type { Project, ProjectCategory } from '@/types/project'

export const SITE_URL = 'https://brunacamara-arq.com.br'
export const SITE_NAME = 'Bruna Câmara | Arquitetura e Design de Interiores'
export const SITE_DESCRIPTION =
  'Bruna Câmara, arquiteta no Rio de Janeiro e Niterói. Projetos de arquitetura residencial, comercial e design de interiores personalizados.'
export const LOCALE = 'pt_BR'
export const OG_IMAGE = `${SITE_URL}/images/og-image.jpg`
export const TWITTER_HANDLE = '@brunacamara.arq'

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

export function getProjectSeo(project: Project): SeoProps {
  const category = categoryLabels[project.category]
  return {
    title: `${project.title} | Bruna Câmara — Projeto de Arquitetura ${category}`,
    description: project.description.slice(0, 155),
    canonical: `${SITE_URL}/projetos/${project.slug}`,
    ogType: 'article',
    ogImage: project.coverImage,
  }
}