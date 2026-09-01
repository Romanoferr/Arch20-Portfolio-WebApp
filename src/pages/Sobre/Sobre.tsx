import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { fadeInUp } from '@/utils/animations'
import { buildSrcSet, imageUrl } from '@/utils/imageUrl'
import type { ImagePreset } from '@/utils/imageUrl'
import { SEO } from '@/components/SEO/SEO'
import { JSONLDPerson } from '@/components/SEO/JSONLD'
import { pageSeo } from '@/utils/seo'
import { HERO_OBJECT_KEYS } from '@/lib/r2'
import { siteConfig } from '@/config/site'

const SOBRE_PROFILE_KEY = HERO_OBJECT_KEYS.sobrePerfil
const PROFILE_PRESETS: ImagePreset[] = ['mobile', 'tablet', 'gallery']

export function Sobre() {
  const personData = {
    name: siteConfig.name,
    jobTitle: 'Arquiteto(a) e Urbanista',
    description:
      'Escritório de arquitetura dedicado a transformar ideias em espaços funcionais, confortáveis e duradouros.',
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.whatsapp || siteConfig.contact.phone,
    alumniOf: '',
    sameAs: siteConfig.social.instagram ? [siteConfig.social.instagram] : [],
    areaServed: [siteConfig.address.city].filter(Boolean),
  }

  return (
    <>
      <SEO {...pageSeo.sobre} />
      <JSONLDPerson {...personData} />
      <Hero
        compact
        title="Sobre"
        subtitle=""
        showCta={false}
        image={HERO_OBJECT_KEYS.sobre}
      />

      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <h4 className="heading-section mt-2 mb-6">
                {siteConfig.name}
              </h4>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  Somos um escritório de arquitetura dedicado a transformar ideias em
                  espaços bem planejados, confortáveis e duradouros. Acreditamos que um
                  bom projeto vai muito além da estética: cada ambiente deve refletir a
                  personalidade, as necessidades e o estilo de vida de quem o vivencia.
                </p>
                <p>
                  Atuamos de forma integrada nas áreas de arquitetura e design de
                  interiores, acompanhando o cliente em diferentes etapas do projeto —
                  do desenvolvimento do projeto arquitetônico ao gerenciamento de obras,
                  avaliação de imóveis e regularização.
                </p>
                <p>
                  Nosso compromisso é desenvolver soluções que equilibrem funcionalidade,
                  qualidade, criatividade e viabilidade financeira, sempre buscando o
                  melhor custo-benefício sem abrir mão da excelência.
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
                src={imageUrl(SOBRE_PROFILE_KEY, 'tablet')}
                srcSet={buildSrcSet(SOBRE_PROFILE_KEY, PROFILE_PRESETS)}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt={`${siteConfig.name} — foto de perfil`}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/5] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>


    </>
  )
}
