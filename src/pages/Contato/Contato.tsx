import { motion } from 'framer-motion'
import { Mail, Phone } from 'lucide-react'
import { Hero } from '@/components/Hero/Hero'
import { ContactForm } from '@/components/ContactForm/ContactForm'
import { siteInfo } from '@/data/navigation'
import { fadeInUp } from '@/utils/animations'
import { SEO } from '@/components/SEO/SEO'
import { pageSeo } from '@/utils/seo'
import { HERO_OBJECT_KEYS } from '@/lib/r2'
import { trackEvent } from '@/lib/analytics/tracker'

export function Contato() {
  return (
    <>
      <SEO {...pageSeo.contato} />

      <Hero
        compact
        title="Contato"
        subtitle=""
        showCta={false}
        image={HERO_OBJECT_KEYS.contatoHero}
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
                    <a
                      href={`mailto:${siteInfo.email}`}
                      onClick={() => trackEvent('email')}
                      className="text-sm text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
                    >
                      {siteInfo.email}
                    </a>
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
