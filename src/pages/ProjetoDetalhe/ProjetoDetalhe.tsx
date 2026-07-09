import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, Ruler } from 'lucide-react'
import { getProjectBySlug } from '@/data/projects'
import { fadeInUp, staggerContainer } from '@/utils/animations'

const categoryLabels = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  interiores: 'Interiores',
}

export function ProjetoDetalhe() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined

  if (!project) {
    return (
      <div className="container-main section-padding text-center pt-32">
        <h1 className="heading-section mb-4">Projeto não encontrado</h1>
        <p className="text-muted mb-8">O projeto que você procura não existe ou foi removido.</p>
        <Link to="/projetos" className="btn-outline">
          <ArrowLeft size={16} />
          Voltar aos projetos
        </Link>
      </div>
    )
  }

  return (
    <>
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-end">
        <div className="absolute inset-0">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="container-main relative z-10 pb-12 pt-32">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Link
              to="/projetos"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar aos projetos
            </Link>
            <span className="block text-xs tracking-[0.2em] uppercase text-white/60 mb-2">
              {categoryLabels[project.category]}
            </span>
            <h1 className="heading-display text-white">{project.title}</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <h2 className="font-serif text-2xl mb-6">Sobre o projeto</h2>
              <p className="text-muted leading-relaxed mb-8">{project.description}</p>

              <dl className="space-y-4 border-t border-[var(--color-border)] pt-8">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-[var(--color-accent)] shrink-0" />
                  <div>
                    <dt className="text-[10px] tracking-[0.2em] uppercase text-muted">Local</dt>
                    <dd className="text-sm">{project.location}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler size={18} className="text-[var(--color-accent)] shrink-0" />
                  <div>
                    <dt className="text-[10px] tracking-[0.2em] uppercase text-muted">Área</dt>
                    <dd className="text-sm">{project.area}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-[var(--color-accent)] shrink-0" />
                  <div>
                    <dt className="text-[10px] tracking-[0.2em] uppercase text-muted">Ano</dt>
                    <dd className="text-sm">{project.year}</dd>
                  </div>
                </div>
              </dl>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 grid grid-cols-1 gap-4"
            >
              {project.images.map((image, index) => (
                <motion.div key={`${image}-${index}`} variants={fadeInUp}>
                  <img
                    src={image}
                    alt={`${project.title} — foto ${index + 1}`}
                    loading="lazy"
                    className="w-full aspect-[16/10] object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
