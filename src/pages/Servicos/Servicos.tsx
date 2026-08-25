import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { ServiceCard } from '@/components/ServiceCard/ServiceCard'
import { services } from '@/data/services'
import { fadeInUp, staggerContainer } from '@/utils/animations'
import { SEO } from '@/components/SEO/SEO'
import { pageSeo } from '@/utils/seo'
import { HERO_OBJECT_KEYS } from '@/lib/r2'

export function Servicos() {
  return (
    <>
      <SEO {...pageSeo.servicos} />

      <Hero
        compact
        title="Serviços"
        subtitle=""
        showCta={false}
        image={HERO_OBJECT_KEYS.servicos}
      />

      <section className="section-padding">
        <div className="container-main">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mb-12"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
              Expertise
            </span>
            <h2 className="heading-section mt-2 mb-4">Como podemos ajudar</h2>
            <p className="text-muted">
              Cada cliente é único. Oferecemos serviços personalizados que atendem às
              necessidades específicas, com atenção aos detalhes e
              compromisso com a excelência.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
