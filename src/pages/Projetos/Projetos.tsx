import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Hero } from '@/components/Hero/Hero'
import { Gallery } from '@/components/Gallery/Gallery'
import { useProjects } from '@/hooks/useProjects'
import { fadeInUp } from '@/utils/animations'

export function Projetos() {
  const { projects, loading, error } = useProjects({ mode: 'published' })

  return (
    <>
      <Hero
        compact
        title="Projetos"
        subtitle="Explore nosso portfólio de arquitetura residencial, comercial e design de interiores."
        showCta={false}
        image="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Projeto/sala_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIFByb2pldG8vc2FsYV8wMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0NDAzMTYxLCJleHAiOjIwOTk3NjMxNjF9.n4_9xpK7ywHJn0CxjQkdGhp2wtEjpGWJtW8zbdlkNv4"
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
              {loading ? 'Carregando projetos...' : `${projects.length} projetos realizados`}
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
