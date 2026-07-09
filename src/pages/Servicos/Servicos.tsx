import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { ServiceCard } from '@/components/ServiceCard/ServiceCard'
import { services } from '@/data/services'
import { fadeInUp, staggerContainer } from '@/utils/animations'

export function Servicos() {
  return (
    <>
      <Hero
        compact
        title="Serviços"
        subtitle="Soluções completas em arquitetura e design de interiores, do conceito à entrega."
        showCta={false}
        image="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80"
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
              Cada projeto é único. Oferecemos serviços personalizados que atendem às
              necessidades específicas de cada cliente, com atenção aos detalhes e
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

      <section className="section-padding bg-[var(--color-surface)]">
        <div className="container-main">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="heading-section mb-6">Nosso processo</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left md:text-center">
              {[
                { step: '01', title: 'Briefing', desc: 'Entendemos suas necessidades, estilo e objetivos.' },
                { step: '02', title: 'Conceito', desc: 'Desenvolvemos o projeto com esboços e referências.' },
                { step: '03', title: 'Projeto', desc: 'Detalhamos plantas, materiais e especificações.' },
                { step: '04', title: 'Obra', desc: 'Acompanhamos a execução até a entrega final.' },
              ].map((item) => (
                <div key={item.step}>
                  <span className="font-serif text-3xl text-[var(--color-accent)]">{item.step}</span>
                  <h3 className="font-serif text-lg mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
