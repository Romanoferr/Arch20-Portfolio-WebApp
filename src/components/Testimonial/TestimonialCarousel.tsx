import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Testimonial as TestimonialData } from '@/data/testimonials'
import { Testimonial as TestimonialCard } from '@/components/Testimonial/Testimonial'

interface TestimonialCarouselProps {
  testimonials: TestimonialData[]
}

const DRAG_THRESHOLD = 60

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)
  const dragOffset = useRef(0)

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

  const handleDrag = (_event: unknown, info: PanInfo) => {
    dragOffset.current = info.offset.x
  }

  const handleDragEnd = () => {
    if (Math.abs(dragOffset.current) < DRAG_THRESHOLD) {
      return
    }

    if (dragOffset.current < 0) {
      // Arrastou para a esquerda → próximo
      goTo((activeIndex + 1) % testimonials.length)
    } else {
      // Arrastou para a direita → anterior
      goTo((activeIndex - 1 + testimonials.length) % testimonials.length)
    }

    dragOffset.current = 0
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
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 0.98, opacity: 0.9 }}
            className="cursor-grab active:cursor-grabbing touch-pan-y select-none"
          >
            <TestimonialCard testimonial={testimonials[activeIndex]} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-[var(--color-accent)]' : 'w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-accent)]/70'
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
