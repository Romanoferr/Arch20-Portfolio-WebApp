import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Hero } from '@/components/Hero/Hero'
import { Gallery } from '@/components/Gallery/Gallery'
import { ServiceCard } from '@/components/ServiceCard/ServiceCard'
import { TestimonialCarousel } from '@/components/Testimonial/TestimonialCarousel'
import { getFeaturedProjects } from '@/data/projects'
import { services } from '@/data/services'
import { testimonials } from '@/data/testimonials'
import { fadeInUp, staggerContainer } from '@/utils/animations'

export function Home() {
  const featuredProjects = getFeaturedProjects(3)
  const featuredServices = services.slice(0, 3)

  return (
    <>
      <Hero />

      <section className="section-padding">
        <div className="container-main">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center md:text-left mb-12"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
              Portfólio
            </span>
            <h2 className="heading-section mt-2 mb-4">Projetos em destaque</h2>
            <p className="text-muted max-w-xl mx-auto md:mx-0">
              Uma seleção dos nossos trabalhos mais recentes em arquitetura residencial,
              comercial e design de interiores.
            </p>
          </motion.div>

          <Gallery projects={featuredProjects} />

          <div className="text-center mt-10">
            <Link to="/projetos" className="btn-outline">
              Ver todos os projetos
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-[var(--color-surface)]">
        <div className="container-main">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center md:text-left mb-12"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
              Serviços
            </span>
            <h2 className="heading-section mt-2 mb-4">O que fazemos</h2>
            <p className="text-muted max-w-xl mx-auto md:mx-0">
              Do conceito à execução, oferecemos soluções completas em arquitetura e interiores.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Link to="/servicos" className="btn-outline">
              Conheça todos os serviços
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-main">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      <section className="section-padding bg-[var(--color-text)] text-white">
        <div className="container-main text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="heading-section text-white mb-4">
              Vamos criar juntos?
            </h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Conte-nos sobre seu projeto e descubra como podemos transformar suas ideias em espaços únicos.
            </p>
            <Link
              to="/contato"
              className="btn-primary bg-white text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white"
            >
              Iniciar conversa
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
