import { motion } from 'framer-motion'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Hero } from '@/components/Hero/Hero'
import { ContactForm } from '@/components/ContactForm/ContactForm'
import { siteInfo } from '@/data/navigation'
import { fadeInUp } from '@/utils/animations'

export function Contato() {
  return (
    <>
      <Hero
        compact
        title="Contato"
        subtitle="Estamos prontos para ouvir sobre seu projeto. Entre em contato."
        showCta={false}
        image="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80"
      />

      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
                Fale conosco
              </span>
              <h2 className="heading-section mt-2 mb-6">
                Vamos conversar sobre seu projeto
              </h2>
              <p className="text-muted mb-8 leading-relaxed">
                Preencha o formulário ao lado ou utilize nossos canais de contato.
                Respondemos em até 48 horas úteis.
              </p>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)] shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted mb-1">Telefone</p>
                    <p className="text-sm">{siteInfo.phone}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)] shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted mb-1">E-mail</p>
                    <p className="text-sm">{siteInfo.email}</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-[var(--color-surface)] p-8 md:p-10 border border-[var(--color-border)]"
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
