import { useEffect, useRef, useState, type JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { navLinks, siteInfo } from '@/data/navigation'
import { cn } from '@/utils/cn'
import { slideInRight } from '@/utils/animations'
import logo from '@/assets/logos/logo.svg'

export function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    if (isOpen) {
      // focus first link inside menu for accessibility
      setTimeout(() => firstLinkRef.current?.focus(), 50)
    } else {
      menuButtonRef.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
          'backdrop-blur-sm',
          isScrolled
            ? 'bg-white/95 shadow-sm border-b border-gray-100'
            : 'bg-transparent',
        )}
      >
        <nav className="container-main flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt={siteInfo.name} className="w-8 h-8" />
            <div className="hidden sm:block">
              <span className="block font-serif text-lg tracking-widest uppercase leading-none">
                {siteInfo.name}
              </span>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-muted mt-0.5">
                {siteInfo.tagline}
              </span>
            </div>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    'text-xs tracking-[0.15em] uppercase transition-colors duration-200',
                    location.pathname === link.path
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text)] hover:text-[var(--color-accent)]',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 -mr-2 text-[var(--color-text)]"
            aria-label="Abrir menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden
            />

            <motion.aside
              id="mobile-menu"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white md:hidden flex flex-col shadow-lg"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <span className="font-serif text-lg tracking-widest uppercase">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2"
                  aria-label="Fechar menu"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto">
                <ul className="flex flex-col p-6 gap-1">
                  {navLinks.map((link, idx) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        ref={idx === 0 ? firstLinkRef : undefined}
                        className={cn(
                          'block py-3 text-sm tracking-[0.15em] uppercase transition-colors px-2',
                          location.pathname === link.path
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-text)] hover:text-[var(--color-accent)]',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
