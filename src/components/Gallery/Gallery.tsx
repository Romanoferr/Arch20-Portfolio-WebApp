import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Project, ProjectCategory } from '@/data/projects'
import { projectCategories } from '@/data/projects'
import { fadeInUp, staggerContainer } from '@/utils/animations'
import { cn } from '@/utils/cn'

interface GalleryProps {
  projects: Project[]
  showFilters?: boolean
  limit?: number
}

export function Gallery({ projects, showFilters = false, limit }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'todos'>('todos')

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'todos') {
      return projects
    }

    return projects.filter((project) => project.category === activeCategory)
  }, [activeCategory, projects])

  const displayedProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-10 justify-center md:justify-start">
          {projectCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                'px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-200 border',
                activeCategory === cat.value
                  ? 'bg-[var(--color-text)] text-white border-[var(--color-text)]'
                  : 'bg-transparent text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <motion.div
        key={activeCategory}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {displayedProjects.length > 0 ? (
          displayedProjects.map((project) => (
            <motion.div key={project.id} variants={fadeInUp}>
              <Link
                to={`/projetos/${project.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-[var(--color-border)]"
              >
                <img
                  src={project.coverImage}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-6">
                  <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/70">
                      {project.category}
                    </span>
                    <h3 className="font-serif text-xl text-white mt-1">{project.title}</h3>
                    <p className="text-xs text-white/60 mt-1">{project.location}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full rounded border border-[var(--color-border)] bg-[var(--color-background)]/70 px-6 py-10 text-center text-sm text-[var(--color-muted)]">
            Nenhum projeto encontrado para esta categoria.
          </div>
        )}
      </motion.div>
    </div>
  )
}
