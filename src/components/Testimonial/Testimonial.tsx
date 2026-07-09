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
      className="relative max-w-3xl mx-auto text-center px-4"
    >
      <Quote
        size={32}
        className="mx-auto mb-6 text-[var(--color-accent)] opacity-60"
        strokeWidth={1}
      />
      <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-8 italic">
        "{testimonial.quote}"
      </p>
      <footer>
        <cite className="not-italic">
          <span className="block text-sm font-medium tracking-wide">
            {testimonial.author}
          </span>
          <span className="block text-xs text-muted mt-1 tracking-wider uppercase">
            {testimonial.project}
          </span>
        </cite>
      </footer>
    </motion.blockquote>
  )
}
