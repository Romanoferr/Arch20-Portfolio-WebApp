import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { ServiceCard } from '@/components/ServiceCard/ServiceCard'
import { services } from '@/data/services'
import { fadeInUp, staggerContainer } from '@/utils/animations'
import { SEO } from '@/components/SEO/SEO'
import { pageSeo } from '@/utils/seo'

export function Servicos() {
  return (
    <>
      <SEO {...pageSeo.servicos} />

      <Hero
        compact
        title="Serviços"
        subtitle=""
        showCta={false}
        image="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/public/project-images/projects/86deef54-8cb6-4d19-8f93-33cc74cc5a06/c46ac8b3-df8b-4b2a-bc59-a5ef21e36d3d.png"
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
