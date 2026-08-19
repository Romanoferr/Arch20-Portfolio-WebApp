import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { fadeInUp } from '@/utils/animations'
import { buildSrcSet, optimizedSrc } from '@/utils/imageUrl'
import { SEO } from '@/components/SEO/SEO'
import { JSONLDPerson } from '@/components/SEO/JSONLD'
import { pageSeo } from '@/utils/seo'

export function Sobre() {
  const personData = {
    name: 'Bruna Câmara',
    jobTitle: 'Arquiteta e Urbanista',
    description:
      'Arquiteta e Urbanista formada pela UFRJ, especialista em Design de Interiores. À frente da Control B Home, atua com projetos de arquitetura residencial, comercial, design de interiores, financiamento imobiliário e regularização de imóveis no Rio de Janeiro e Niterói.',
    email: 'camarabruna.arq@gmail.com',
    telephone: '+5521985330175',
    alumniOf: 'Universidade Federal do Rio de Janeiro (UFRJ)',
    sameAs: ['https://instagram.com/brunacamara.arq'],
    areaServed: ['Rio de Janeiro', 'Niterói'],
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
        image="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/public/project-images/heroes/4932a4d8-9ca4-47e9-bee4-52dffdb2b78b.png"
      />

      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <h4 className="heading-section mt-2 mb-6">
                Bruna Câmara
              </h4>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  Sou Arquiteta e Urbanista formada pela Universidade Federal do Rio de Janeiro (UFRJ). Atualmente, amplio minha formação por meio da especialização em Design de Interiores, também pela UFRJ, buscando oferecer soluções ainda mais completas, funcionais e personalizadas aos meus clientes. 
                </p>
                <p>
                  À frente da Control B Home, atuo de forma integrada nas áreas de arquitetura e financiamento imobiliário, proporcionando um atendimento que acompanha o cliente em diferentes etapas do seu projeto. Além do desenvolvimento de projetos arquitetônicos e do gerenciamento de obras, ofereço serviços de avaliação de imóveis, regularização e legalização de imóveis, além de consultoria e elaboração de planilhas para financiamento imobiliário pela Caixa Econômica Federal. 
                </p>
                <p>
                  Acredito que um bom projeto vai muito além da estética. Cada ambiente deve refletir a personalidade, as necessidades e o estilo de vida de quem irá vivê-lo. Por isso, meu compromisso é desenvolver soluções que equilibrem funcionalidade, qualidade, criatividade e viabilidade financeira, sempre buscando o melhor custo-benefício sem abrir mão da excelência.
                </p>
                <p>
                  Cada trabalho é conduzido com responsabilidade, atenção aos detalhes e transparência em todas as etapas, proporcionando segurança, organização e tranquilidade durante todo o processo. Meu objetivo é transformar ideias em espaços bem planejados, confortáveis e duradouros, entregando resultados que superem as expectativas e agreguem valor ao patrimônio e à experiência de cada cliente.
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
                src={optimizedSrc('https://skgetxxliperptipaitk.supabase.co/storage/v1/object/public/project-images/heroes/IMG_2441.JPG', 800)}
                srcSet={buildSrcSet('https://skgetxxliperptipaitk.supabase.co/storage/v1/object/public/project-images/heroes/IMG_2441.JPG', [400, 800, 1200])}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt="Bruna Câmara — Arquiteta e Urbanista — foto de perfil profissional"
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
