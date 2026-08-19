import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Hero } from '@/components/Hero/Hero'
import { Gallery } from '@/components/Gallery/Gallery'
import { useProjects } from '@/hooks/useProjects'
import { fadeInUp } from '@/utils/animations'
import { SEO } from '@/components/SEO/SEO'
import { pageSeo } from '@/utils/seo'

export function Projetos() {
  const { projects, loading, error } = useProjects({ mode: 'published' })

  return (
    <>
      <SEO {...pageSeo.projetos} />

      <Hero
        compact
        title="Projetos"
        subtitle=""
        showCta={false}
        image="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/public/project-images/projects/86deef54-8cb6-4d19-8f93-33cc74cc5a06/d2315cb1-68a0-4760-bf97-4249af291c99.png"
      />

      <section className="section-padding">
        <div className="container-main">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
              Portfólio
            </span>
            <h2 className="heading-section mt-2">
              {loading ? 'Carregando projetos...' : `${projects.length} Projetos Selecionados`}
            </h2>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--color-muted)]">
              <Loader2 size={18} className="animate-spin" />
              Carregando projetos...
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <Gallery projects={projects} showFilters />
          )}
        </div>
      </section>
    </>
  )
}
