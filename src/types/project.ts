export type ProjectCategory = 'residencial' | 'comercial' | 'interiores'

export interface ProjectImage {
  id: string
  storagePath: string
  publicUrl: string
  isCover: boolean
  displayOrder: number
  createdAt: string
}

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
  projectImages?: ProjectImage[]
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
