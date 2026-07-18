import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeInUp } from '@/utils/animations'

interface HeroProps {
  title?: string
  subtitle?: string
  image?: string
  showCta?: boolean
  compact?: boolean
}

export function Hero({
  title = 'Projetos de arquitetura e design de interiores',
  subtitle = 'Transforme seus espaços com soluções criativas e funcionais, que refletem seu estilo de vida e personalidade.',
  image = 'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/inicio/teste%20fachada.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvaW5pY2lvL3Rlc3RlIGZhY2hhZGEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDM5MTEwOCwiZXhwIjoyMDk5NzUxMTA4fQ.VU7vNXGYfKEpG3i_uwUlTa-p_A67epHLDZ5WSkU-pB4',
  showCta = true,
  compact = false,
}: HeroProps) {
  return (
    <section
      className={`relative flex items-center overflow-hidden ${
        compact ? 'min-h-[50vh] md:min-h-[55vh]' : 'min-h-[85vh] md:min-h-[90vh]'
      }`}
    >
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
      </div>

      <div className="container-main relative z-10 pt-20">
        <div className="max-w-2xl text-center md:text-left">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="heading-display text-white whitespace-pre-line mb-6"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-white/80 text-base md:text-lg max-w-lg mx-auto md:mx-0 mb-8 leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {showCta && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link to="/projetos" className="btn-primary">
                Ver projetos
                <ArrowRight size={16} />
              </Link>
              <Link to="/contato" className="btn-outline border-white text-white hover:bg-white hover:text-[var(--color-text)]">
                Fale conosco
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
