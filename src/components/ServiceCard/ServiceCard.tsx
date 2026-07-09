import { motion } from 'framer-motion'
import type { Service } from '@/data/services'
import { fadeInUp } from '@/utils/animations'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon

  return (
    <motion.div
      variants={fadeInUp}
      className="group p-8 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors duration-300"
    >
      <div className="w-12 h-12 flex items-center justify-center mb-6 text-[var(--color-accent)]">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-xl mb-3">{service.title}</h3>
      <p className="text-sm text-muted leading-relaxed">{service.description}</p>
    </motion.div>
  )
}
