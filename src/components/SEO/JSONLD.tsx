import { Helmet } from 'react-helmet-async'
import {
  CONTACT,
  LOCALE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_SHORT,
  SITE_URL,
} from '@/utils/seo'
import { getImageUrl } from '@/lib/r2'
import type { Project } from '@/types/project'
import { siteConfig } from '@/config/site'

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

export function JSONLDOrganization() {
  const schema = jsonLdString({
    '@type': 'Organization',
    name: SITE_NAME_SHORT,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    email: CONTACT.email,
    telephone: CONTACT.telephone,
    sameAs: CONTACT.instagram ? [CONTACT.instagram] : [],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CONTACT.telephone,
      contactType: 'customer service',
      areaServed: CONTACT.areaServed,
      availableLanguage: 'pt-BR',
    },
  })

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  )
}

export function JSONLDLocalBusiness() {
  const schema = jsonLdString({
    '@type': 'ProfessionalService',
    name: `${siteConfig.name} - Arquitetura e Design de Interiores`,
    description:
      'Serviços de arquitetura residencial, comercial, design de interiores, reformas, paisagismo e consultoria.',
    url: SITE_URL,
    telephone: CONTACT.telephone,
    email: CONTACT.email,
    image: `${SITE_URL}/images/og-image.jpg`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.state,
      addressCountry: CONTACT.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CONTACT.geo.latitude,
      longitude: CONTACT.geo.longitude,
    },
    areaServed: CONTACT.areaServed.map((city) => ({
      '@type': 'City',
      name: city,
    })),
    sameAs: [CONTACT.instagram],
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
    alumniOf: data.alumniOf
      ? {
          '@type': 'CollegeOrUniversity',
          name: data.alumniOf,
        }
      : undefined,
    areaServed: data.areaServed
      .filter(Boolean)
      .map((city) => ({
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
    description: SITE_DESCRIPTION,
    inLanguage: LOCALE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/projetos/?q={search_term_string}`,
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

/** Alias de compatibilidade — ver JSONLDLocalBusiness. */
export const JSONLDProfessionalService = JSONLDLocalBusiness

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
    dateModified: project.updatedAt,
    image: project.coverImageStorage
      ? getImageUrl(project.coverImageStorage, 'social')
      : project.coverImage,
    url: `${SITE_URL}/projetos/${project.slug}/`,
    mainEntityOfPage: `${SITE_URL}/projetos/${project.slug}/`,
    author: {
      '@type': 'Organization',
      name: SITE_NAME_SHORT,
    },
  })

  return (
    <Helmet>
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  )
}