import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeInUp } from '@/utils/animations'
import { FULL_WIDTH_SIZES, FULL_WIDTH_SRCSET, optimizedHeroSrc } from '@/utils/imageUrl'
import { getImageUrl, HERO_OBJECT_KEYS } from '@/lib/r2'

interface HeroProps {
  title?: string
  subtitle?: string
  image?: string
  showCta?: boolean
  compact?: boolean
}

export function Hero({
  title = 'Arquitetura &\n Design de Interiores',
  subtitle = '',
  image = getImageUrl(HERO_OBJECT_KEYS.home),
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
          src={optimizedHeroSrc(image, 1600)}
          srcSet={FULL_WIDTH_SRCSET.map((w) => `${optimizedHeroSrc(image, w)} ${w}w`).join(', ')}
          sizes={FULL_WIDTH_SIZES}
          alt=""
          fetchPriority="high"
          decoding="async"
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
            className="heading-display text-white whitespace-pre-line mb-6 [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]"
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
              <Link
                to="/projetos/"
                className="btn-primary bg-[var(--color-accent)] text-white hover:bg-[var(--color-text)] hover:text-white"
              >
                Ver projetos
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contato/"
                className="btn-primary bg-[var(--color-accent)] text-white hover:bg-[var(--color-text)] hover:text-white"
              >
                Fale conosco
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
