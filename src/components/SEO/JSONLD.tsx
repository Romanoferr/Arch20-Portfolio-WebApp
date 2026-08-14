import { Helmet } from 'react-helmet-async'
import { SITE_URL, SITE_NAME } from '@/utils/seo'
import type { Project } from '@/types/project'

interface PersonSchema {
  name: string
  jobTitle: string
  description: string
  email: string
  telephone: string
  alumniOf: string
  sameAs: string[]
  areaServed: string[]
}

interface BreadcrumbItem {
  name: string
  path: string
}

function jsonLdString(data: Record<string, unknown>): string {
  return JSON.stringify({ '@context': 'https://schema.org', ...data })
}

export function JSONLDPerson(data: PersonSchema) {
  const schema = jsonLdString({
    '@type': 'Person',
    name: data.name,
    givenName: data.name.split(' ')[0],
    familyName: data.name.split(' ').slice(1).join(' '),
    jobTitle: data.jobTitle,
    description: data.description,
    email: data.email,
    telephone: data.telephone,
    url: SITE_URL,
    sameAs: data.sameAs,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: data.alumniOf,
    },
    areaServed: data.areaServed.map((city) => ({
      '@type': 'City',
      name: city,
    })),
  })

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  )
}

export function JSONLDWebsite() {
  const schema = jsonLdString({
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Portfólio de arquitetura com projetos residenciais, comerciais e design de interiores no Rio de Janeiro e Niterói.',
    inLanguage: 'pt-BR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/projetos?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  )
}

export function JSONLDProfessionalService() {
  const schema = jsonLdString({
    '@type': 'ProfessionalService',
    name: 'Bruna Câmara - Arquitetura e Design de Interiores',
    description:
      'Serviços de arquitetura residencial, comercial, design de interiores, reformas, paisagismo e consultoria.',
    url: SITE_URL,
    telephone: '+5521985330175',
    email: 'camarabruna.arq@gmail.com',
    areaServed: [
      { '@type': 'City', name: 'Rio de Janeiro' },
      { '@type': 'City', name: 'Niterói' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços de Arquitetura',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Arquitetura Residencial',
            description:
              'Projetos de casas e apartamentos que traduzem o estilo de vida dos moradores em espaços funcionais e acolhedores.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Arquitetura Comercial',
            description:
              'Escritórios, lojas e espaços corporativos projetados para fortalecer a identidade da marca.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Design de Interiores',
            description:
              'Ambientação completa com seleção de materiais, mobiliário sob medida e iluminação.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Reformas e Retrofit',
            description:
              'Revitalização de imóveis existentes com soluções criativas que respeitam a estrutura original.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Paisagismo',
            description:
              'Integração entre arquitetura e natureza com jardins, terraços e áreas externas.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Consultoria e Acompanhamento de Obra',
            description:
              'Orientação em todas as etapas — do conceito à obra — garantindo decisões alinhadas ao projeto.',
          },
        },
      ],
    },
  })

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  )
}

export function JSONLDBreadcrumbList({ items }: { items: BreadcrumbItem[] }) {
  const schema = jsonLdString({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  })

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  )
}

export function JSONLDProject({ project }: { project: Project }) {
  const categoryLabels: Record<string, string> = {
    residencial: 'Residencial',
    comercial: 'Comercial',
    interiores: 'Interiores',
  }

  const schema = jsonLdString({
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    genre: categoryLabels[project.category] || project.category,
    contentLocation: project.location,
    dateCreated: project.year ? `${project.year}` : undefined,
    image: project.coverImage,
    url: `${SITE_URL}/projetos/${project.slug}`,
    author: {
      '@type': 'Person',
      name: 'Bruna Câmara',
    },
  })

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  )
}