import {
  createProject,
  deleteProject,
  getFeaturedProjects,
  getProjectById,
  getProjectBySlug,
  getProjects,
  projectCategories,
} from '@/services/projectsService'

export type { Project, ProjectCategory, ProjectInput } from '@/types/project'
export { createProject, deleteProject, getFeaturedProjects, getProjectById, getProjectBySlug, getProjects, projectCategories }

export const projects = getProjects()
