import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import type { Testimonial } from '@/data/testimonials'
import { fadeInUp } from '@/utils/animations'

interface TestimonialProps {
  testimonial: Testimonial
}

export function Testimonial({ testimonial }: TestimonialProps) {
  return (
    <motion.blockquote
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative max-w-3xl mx-auto text-center px-4 py-4"
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="mx-auto mb-2.5 w-fit"
      >
        <Quote
          size={18}
          className="text-[var(--color-accent)] opacity-60"
          strokeWidth={1}
        />
      </motion.div>
      <p className="font-serif text-base md:text-lg leading-snug mb-3.5">
        "{testimonial.quote}"
      </p>
      <footer>
        <cite className="not-italic">
          <span className="block text-xs font-medium tracking-wide">
            {testimonial.author}
          </span>
          <span className="block text-[12px] text-muted mt-0.9 tracking-wider">
            {testimonial.project}
          </span>
        </cite>
      </footer>
    </motion.blockquote>
  )
}
