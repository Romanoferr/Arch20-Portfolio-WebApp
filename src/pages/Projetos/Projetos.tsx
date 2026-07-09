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
        image="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80"
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
