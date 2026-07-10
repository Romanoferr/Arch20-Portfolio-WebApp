import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Testimonial as TestimonialData } from '@/data/testimonials'
import { Testimonial as TestimonialCard } from '@/components/Testimonial/Testimonial'

interface TestimonialCarouselProps {
  testimonials: TestimonialData[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [cycleKey, testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  const goTo = (index: number) => {
    setActiveIndex(index)
    setCycleKey((current) => current + 1)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonials[activeIndex].id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="cursor-grab active:cursor-grabbing"
          >
            <TestimonialCard testimonial={testimonials[activeIndex]} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex ? 'w-8 bg-[var(--color-accent)]' : 'w-2.5 bg-[var(--color-border)] hover:bg-[var(--color-accent)]/70'
              }`}
              aria-label={`Ir para o depoimento ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
