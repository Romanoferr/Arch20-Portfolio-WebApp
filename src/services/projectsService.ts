import type { Project, ProjectCategory, ProjectInput } from '@/types/project'

export const projectCategories: { value: ProjectCategory | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'interiores', label: 'Interiores' },
]

const STORAGE_KEY = 'portfolio-admin-projects-v1'

const seedProjects: Project[] = [
  {
    id: '1',
    slug: 'flat-itacoatiara',
    title: 'Flat Itacoatiara',
    category: 'residencial',
    year: 2024,
    location: 'Niterói, RJ',
    area: '980 m²',
    description:
      'Reforma de fachada predial completa com foco em iluminação cênica e valorização da vista para o mar. Projeto de interiores com conceito minimalista e integração dos ambientes.',
    coverImage:
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Flat_Itacoatiara/Itacoatira_Cen_1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvRmxhdF9JdGFjb2F0aWFyYS9JdGFjb2F0aXJhX0Nlbl8xLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU5Njg3MTQsImV4cCI6MjEwMTMyODcxNH0.s2qCgAC6e3VbLIUDfXeUZnLGxQRF0BlP1Jmia5BXle0',
    images: [
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Flat_Itacoatiara/Itacoatira_Cen_1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvRmxhdF9JdGFjb2F0aWFyYS9JdGFjb2F0aXJhX0Nlbl8xLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU5Njg3MTQsImV4cCI6MjEwMTMyODcxNH0.s2qCgAC6e3VbLIUDfXeUZnLGxQRF0BlP1Jmia5BXle0',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Flat_Itacoatiara/Itacoatira-Cen-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvRmxhdF9JdGFjb2F0aWFyYS9JdGFjb2F0aXJhLUNlbi0xLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM2OTQ5OTUsImV4cCI6MjIxNTY5NDk5NX0.4cXhJS4tHnit7j5jSa0qYet8kSOxdRGzQfmodsF6nYw',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Flat_Itacoatiara/Itacoatira-Cen-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvRmxhdF9JdGFjb2F0aWFyYS9JdGFjb2F0aXJhLUNlbi0xLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM2OTQ5OTUsImV4cCI6MjIxNTY5NDk5NX0.4cXhJS4tHnit7j5jSa0qYet8kSOxdRGzQfmodsF6nYw',
    ],
    published: true,
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    slug: 'sba-escritorio',
    title: 'SBA Escritório',
    category: 'comercial',
    year: 2025,
    location: 'Niterói, RJ',
    area: '35 m²',
    description:
      'Escritório corporativo compacto com layout funcional e mobiliário ergonômico. A paleta de cores neutras e iluminação natural proporcionam conforto e produtividade.',
    coverImage:
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/SBA/SBA_Cena_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvU0JBL1NCQV9DZW5hXzAxLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM2OTY4MjQsImV4cCI6MjA5OTA1NjgyNH0.wEcu2qdrZAQt7EoSk1LFlz1pMO_Tz15kqq1t98sYocc',
    images: [
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/SBA/SBA_Cena_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvU0JBL1NCQV9DZW5hXzAxLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU5Njg3NzgsImV4cCI6MjEwMTMyODc3OH0.E9cbnTi8aaKKAMLKry3AhxrcnwSA_EMHNtCrOTHBzrU',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/SBA/SBA_Cena_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvU0JBL1NCQV9DZW5hXzAxLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU5Njg3NzgsImV4cCI6MjEwMTMyODc3OH0.E9cbnTi8aaKKAMLKry3AhxrcnwSA_EMHNtCrOTHBzrU',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/SBA/SBA_Cena_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvU0JBL1NCQV9DZW5hXzAxLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU5Njg3NzgsImV4cCI6MjEwMTMyODc3OH0.E9cbnTi8aaKKAMLKry3AhxrcnwSA_EMHNtCrOTHBzrU',
    ],
    published: true,
    order: 2,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    slug: 'apartamento-inga',
    title: 'Apartamento Inga',
    category: 'residencial',
    year: 2025,
    location: 'Niterói, RJ',
    area: '55 m²',
    description:
      'Apartamento compacto com conceito aberto, integração de ambientes e iluminação natural abundante. Mobiliário planejado e acabamentos neutros ampliam a sensação de espaço.',
    coverImage:
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Apto_Inga/Loft_Cozinha_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQXB0b19JbmdhL0xvZnRfQ296aW5oYV8wMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjk3MDYwLCJleHAiOjIwOTkwNTcwNjB9.X1bh2wgobKfUxYTUYYMUMyXM2apcpEUOSKcWtYMYA9s',
    images: [
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Apto_Inga/Loft_Cozinha_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQXB0b19JbmdhL0xvZnRfQ296aW5oYV8wMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjk3MDYwLCJleHAiOjIwOTkwNTcwNjB9.X1bh2wgobKfUxYTUYYMUMyXM2apcpEUOSKcWtYMYA9s',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Apto_Inga/Loft_Cozinha_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQXB0b19JbmdhL0xvZnRfQ296aW5oYV8wMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjk3MDYwLCJleHAiOjIwOTkwNTcwNjB9.X1bh2wgobKfUxYTUYYMUMyXM2apcpEUOSKcWtYMYA9s',
      'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Apto_Inga/Loft_Cozinha_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQXB0b19JbmdhL0xvZnRfQ296aW5oYV8wMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNjk3MDYwLCJleHAiOjIwOTkwNTcwNjB9.X1bh2wgobKfUxYTUYYMUMyXM2apcpEUOSKcWtYMYA9s',
    ],
    published: true,
    order: 3,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
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
    published: true,
    order: 4,
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
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
    published: true,
    order: 5,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z',
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
    published: true,
    order: 6,
    createdAt: '2024-01-06T00:00:00.000Z',
    updatedAt: '2024-01-06T00:00:00.000Z',
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
    published: true,
    order: 7,
    createdAt: '2024-01-07T00:00:00.000Z',
    updatedAt: '2024-01-07T00:00:00.000Z',
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
    published: true,
    order: 8,
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-08T00:00:00.000Z',
  },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getTimestamp() {
  return new Date().toISOString()
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    slug: project.slug || slugify(project.title),
    images: project.images?.filter(Boolean) ?? [],
    coverImage: project.coverImage || project.images?.[0] || '',
    published: project.published ?? true,
    order: project.order ?? 999,
    createdAt: project.createdAt || getTimestamp(),
    updatedAt: project.updatedAt || getTimestamp(),
  }
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order
    }

    return a.title.localeCompare(b.title)
  })
}

function readProjectsFromStorage(): Project[] {
  const storage = getStorage()

  if (!storage) {
    return seedProjects.map(normalizeProject)
  }

  const stored = storage.getItem(STORAGE_KEY)

  if (!stored) {
    storage.setItem(STORAGE_KEY, JSON.stringify(seedProjects.map(normalizeProject)))
    return seedProjects.map(normalizeProject)
  }

  try {
    const parsed = JSON.parse(stored) as Project[]
    return sortProjects(parsed.map(normalizeProject))
  } catch {
    storage.removeItem(STORAGE_KEY)
    return seedProjects.map(normalizeProject)
  }
}

function persistProjects(projects: Project[]) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(sortProjects(projects)))
}

export function getProjects(): Project[] {
  return readProjectsFromStorage()
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((project) => project.id === id)
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug)
}

export function getFeaturedProjects(count = 3): Project[] {
  return getProjects().filter((project) => project.published).slice(0, count)
}

export function createProject(input: ProjectInput): Project {
  const projects = getProjects()
  const timestamp = getTimestamp()
  const nextOrder = Math.max(0, ...projects.map((project) => project.order)) + 1

  const newProject: Project = {
    id: `${Date.now()}`,
    slug: input.slug || slugify(input.title),
    title: input.title,
    category: input.category,
    year: input.year,
    location: input.location,
    area: input.area,
    description: input.description,
    images: input.images ?? [],
    coverImage: input.coverImage ?? input.images?.[0] ?? '',
    published: input.published ?? true,
    order: input.order ?? nextOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const nextProjects = [...projects, normalizeProject(newProject)]
  persistProjects(nextProjects)

  return normalizeProject(newProject)
}

export function updateProject(id: string, input: ProjectInput): Project | undefined {
  const projects = getProjects()
  const existing = projects.find((project) => project.id === id)

  if (!existing) {
    return undefined
  }

  const updatedProject: Project = {
    ...existing,
    ...input,
    id: existing.id,
    slug: input.slug || slugify(input.title || existing.title),
    title: input.title || existing.title,
    category: input.category || existing.category,
    year: input.year || existing.year,
    location: input.location || existing.location,
    area: input.area || existing.area,
    description: input.description || existing.description,
    images: input.images ?? existing.images,
    coverImage: input.coverImage ?? existing.coverImage,
    published: input.published ?? existing.published,
    order: input.order ?? existing.order,
    updatedAt: getTimestamp(),
  }

  const nextProjects = projects.map((project) => (project.id === id ? normalizeProject(updatedProject) : project))
  persistProjects(nextProjects)

  return normalizeProject(updatedProject)
}

export function deleteProject(id: string): boolean {
  const projects = getProjects()
  const nextProjects = projects.filter((project) => project.id !== id)

  if (nextProjects.length === projects.length) {
    return false
  }

  persistProjects(nextProjects)
  return true
}
