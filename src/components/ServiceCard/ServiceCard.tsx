import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
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
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative p-8 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors duration-300 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]"
    >
      {/* Decorative top accent line */}
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-500 ease-out group-hover:scale-x-100" />

      <div className="relative mb-6 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.15, rotate: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] transition-colors duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-white"
        >
          <Icon size={28} strokeWidth={1.5} />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, x: -8 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-accent)] opacity-0 transition-colors duration-300 group-hover:border-[var(--color-accent)] group-hover:opacity-100"
        >
          <ArrowUpRight size={16} />
        </motion.span>
      </div>

      <h3 className="font-serif text-xl mb-3 transition-colors duration-300 group-hover:text-[var(--color-accent)]">
        {service.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed">{service.description}</p>
    </motion.div>
  )
}
