import { useCallback, useEffect, useState } from 'react'
import {
  getFeaturedProjects,
  getProjects,
  getPublishedProjects,
} from '@/services/projectsService'
import type { Project } from '@/types/project'

type ProjectsMode = 'all' | 'published' | 'featured'

interface UseProjectsOptions {
  mode?: ProjectsMode
  limit?: number
}

interface UseProjectsResult {
  projects: Project[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const modeLoaders: Record<ProjectsMode, (limit?: number) => Promise<Project[]>> = {
  all: (limit) => getProjects(false, limit),
  published: (limit) => getPublishedProjects(limit),
  featured: (limit) => getFeaturedProjects(limit ?? 3),
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsResult {
  const { mode = 'all', limit } = options

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await modeLoaders[mode](limit)
      setProjects(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os projetos.')
    } finally {
      setLoading(false)
    }
  }, [mode, limit])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { projects, loading, error, refresh }
}