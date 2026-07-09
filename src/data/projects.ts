export type ProjectCategory = 'residencial' | 'comercial' | 'interiores'

export interface Project {
  id: string
  slug: string
  title: string
  category: ProjectCategory
  year: number
  location: string
  area: string
  description: string
  images: string[]
  coverImage: string
}

export const projectCategories: { value: ProjectCategory | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'interiores', label: 'Interiores' },
]

export const projects: Project[] = [
  {
    id: '1',
    slug: 'flat-praia-de-itacoatiara',
    title: 'Flat Praia de Itacoatiara',
    category: 'residencial',
    year: 2024,
    location: 'Niterói, RJ',
    area: '980 m²',
    description:
      'Reforma de fachada predial completa com foco em iluminação cênica e valorização da vista para o mar. Projeto de interiores com conceito minimalista e integração dos ambientes.',
    coverImage: 'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Itacoatira-Cen-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvSXRhY29hdGlyYS1DZW4tMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjI4NjYwLCJleHAiOjE4MTUxNjQ2NjB9.RhlAbKJAoRRWRfPBPsyFqjUlgkYHf2k_WwYmlFbA7Wc',
    images: [
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Itacoatira-Cen-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvSXRhY29hdGlyYS1DZW4tMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjI4NjYwLCJleHAiOjE4MTUxNjQ2NjB9.RhlAbKJAoRRWRfPBPsyFqjUlgkYHf2k_WwYmlFbA7Wc',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Itacoatira-Cen-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvSXRhY29hdGlyYS1DZW4tMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjI4NjYwLCJleHAiOjE4MTUxNjQ2NjB9.RhlAbKJAoRRWRfPBPsyFqjUlgkYHf2k_WwYmlFbA7Wc',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Itacoatira-Cen-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvSXRhY29hdGlyYS1DZW4tMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjI4NjYwLCJleHAiOjE4MTUxNjQ2NjB9.RhlAbKJAoRRWRfPBPsyFqjUlgkYHf2k_WwYmlFbA7Wc',
    ],
  },
  {
    id: '2',
    slug: 'loft-pinheiros',
    title: 'Loft Pinheiros',
    category: 'interiores',
    year: 2023,
    location: 'São Paulo, SP',
    area: '180 m²',
    description:
      'Reforma completa de loft industrial nos Pinheiros. Pé-direito duplo, mezanino em aço e iluminação cênica valorizam a estrutura original do edifício.',
    coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1615874959477-df969457d699?w=1200&q=80',
    ],
  },
  {
    id: '3',
    slug: 'escritorio-avenida',
    title: 'Escritório Avenida',
    category: 'comercial',
    year: 2024,
    location: 'Rio de Janeiro, RJ',
    area: '650 m²',
    description:
      'Sede corporativa com open space flexível, salas de reunião envidraçadas e áreas de convivência. Paleta neutra e vegetação interior promovem bem-estar e produtividade.',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e97?w=1200&q=80',
    ],
  },
  {
    id: '4',
    slug: 'residencia-lago',
    title: 'Residência Lago',
    category: 'residencial',
    year: 2022,
    location: 'Brasília, DF',
    area: '380 m²',
    description:
      'Casa de campo voltada para o lago, com grandes vãos envidraçados e brises de madeira. A arquitetura dialoga com a paisagem sem competir com ela.',
    coverImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
      'https://images.unsplash.com/photo-1600573472592-401b089b6a22?w=1200&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cd66?w=1200&q=80',
    ],
  },
  {
    id: '5',
    slug: 'apartamento-ipanema',
    title: 'Apartamento Ipanema',
    category: 'interiores',
    year: 2023,
    location: 'Rio de Janeiro, RJ',
    area: '120 m²',
    description:
      'Projeto de interiores para apartamento com vista para o mar. Móveis sob medida, tons claros e texturas naturais ampliam visualmente os ambientes.',
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
      'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80',
    ],
  },
  {
    id: '6',
    slug: 'loja-concept',
    title: 'Loja Concept',
    category: 'comercial',
    year: 2022,
    location: 'Curitiba, PR',
    area: '95 m²',
    description:
      'Loja conceito para marca de moda sustentável. Display modular, iluminação track e acabamentos em terracota e linho criam uma experiência imersiva.',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      'https://images.unsplash.com/photo-1555529669-e67e7a0b9b1a?w=1200&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7bdf1e932?w=1200&q=80',
    ],
  },
  {
    id: '7',
    slug: 'casa-encosta',
    title: 'Casa Encosta',
    category: 'residencial',
    year: 2021,
    location: 'Florianópolis, SC',
    area: '290 m²',
    description:
      'Residência implantada na encosta, com terraços em diferentes níveis. A topografia foi aproveitada para criar relação íntima entre interior e exterior.',
    coverImage: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80',
    ],
  },
  {
    id: '8',
    slug: 'studio-home-office',
    title: 'Studio Home Office',
    category: 'interiores',
    year: 2024,
    location: 'Belo Horizonte, MG',
    area: '45 m²',
    description:
      'Home office compacto e funcional, com estante integrada, mesa retrátil e iluminação regulável. Prova de que poucos metros podem ser muito bem aproveitados.',
    coverImage: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=80',
      'https://images.unsplash.com/photo-1631889992176-5e622d044d08?w=1200&q=80',
      'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80',
    ],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function getFeaturedProjects(count = 3): Project[] {
  return projects.slice(0, count)
}
