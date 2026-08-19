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
        image="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/public/project-images/projects/91a19049-bb49-4d14-85c9-c697be946350/1ac7d3b7-0637-4e34-8d0e-e8f9ec032aad.png"
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
