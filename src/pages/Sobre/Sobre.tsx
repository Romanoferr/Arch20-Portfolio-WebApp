import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { fadeInUp } from '@/utils/animations'

export function Sobre() {
  return (
    <>
      <Hero
        compact
        title="Sobre nós"
        subtitle="Paixão por arquitetura, compromisso com a excelência."
        showCta={false}
        image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80"
      />

      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
                Estúdio Forma
              </span>
              <h2 className="heading-section mt-2 mb-6">
                Arquitetura com propósito
              </h2>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  Fundado em 2015, o Estúdio Forma nasceu da convicção de que a arquitetura
                  deve ir além da estética — deve melhorar a qualidade de vida de quem habita
                  cada espaço que projetamos.
                </p>
                <p>
                  Nossa abordagem combina sensibilidade estética com rigor técnico. Acreditamos
                  em projetos honestos, que respeitam o contexto, a funcionalidade e o
                  orçamento de nossos clientes.
                </p>
                <p>
                  Com sede em São Paulo e projetos em todo o Brasil, nossa equipe multidisciplinar
                  atua em arquitetura residencial, comercial, design de interiores e paisagismo.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80"
                alt="Equipe do estúdio em projeto arquitetônico"
                className="w-full aspect-[4/5] object-cover"
              />
            </motion.div>
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
            className="text-center mb-12"
          >
            <h2 className="heading-section">Nossos valores</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Autenticidade',
                desc: 'Cada projeto reflete a identidade única de quem o habita, sem fórmulas prontas.',
              },
              {
                title: 'Sustentabilidade',
                desc: 'Priorizamos materiais naturais, eficiência energética e soluções duráveis.',
              },
              {
                title: 'Colaboração',
                desc: 'Trabalhamos lado a lado com nossos clientes em todas as etapas do processo.',
              },
            ].map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center p-8"
              >
                <h3 className="font-serif text-xl mb-3">{value.title}</h3>
                <p className="text-sm text-muted">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
