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
  published: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  title: string
  slug?: string
  category: ProjectCategory
  year: number
  location: string
  area: string
  description: string
  images?: string[]
  coverImage?: string
  published?: boolean
  order?: number
}
