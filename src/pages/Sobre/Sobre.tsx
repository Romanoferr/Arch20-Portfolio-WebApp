import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero/Hero'
import { fadeInUp } from '@/utils/animations'

export function Sobre() {
  return (
    <>
      <Hero
        compact
        title="Sobre"
        subtitle=""
        showCta={false}
        image="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Aba%20Sobre/Cena_02.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvQWJhIFNvYnJlL0NlbmFfMDIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDQwMzAzNSwiZXhwIjoyMDk5NzYzMDM1fQ.w5FTbZIWq9cgCD31VxZRfbp0BH4GaIuEBLUm90RU9n8"
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
                src="https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Sobre/sobre.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvU29icmUvc29icmUuanBnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDMyNjY0NSwiZXhwIjoyMDk5Njg2NjQ1fQ.rqpVQARpEax5CDayBAtZtkFC9ejwISPtS1vcZ9MbZl4"
                alt="Equipe do estúdio em projeto arquitetônico"
                className="w-full aspect-[4/5] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>


    </>
  )
}
