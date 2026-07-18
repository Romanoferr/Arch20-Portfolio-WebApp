import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { Gallery } from '@/components/Gallery/Gallery'
import { projects } from '@/data/projects'
import { fadeInUp } from '@/utils/animations'

export function Projetos() {
  return (
    <>
      <Hero
        compact
        title="Projetos"
        subtitle="Explore nosso portfólio de arquitetura residencial, comercial e design de interiores."
        showCta={false}
        image="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Projeto/sala_01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIFByb2pldG8vc2FsYV8wMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0NDAyMDUwLCJleHAiOjIwOTk3NjIwNTB9.uIRnBBa50qvCxniu80rqYXLCLCTUhAHMA9iI3N5-gao"
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
              {projects.length} projetos realizados
            </h2>
          </motion.div>

          <Gallery projects={projects} showFilters />
        </div>
      </section>
    </>
  )
}
