import { useEffect, useRef, useState, type JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { navLinks, siteInfo } from '@/data/navigation'
import { cn } from '@/utils/cn'
import logo from '@/assets/logos/bc-logo-site.png'

export function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null)

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
      <header className="fixed inset-x-4 top-6 z-50 mx-auto flex max-w-7xl rounded-[36px] border border-white/70 bg-white/70 px-4 py-1 shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-md md:inset-x-6 md:px-8">
        <nav className="container-main flex h-10 items-center justify-between gap-6 md:h-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4 group">
              <img src={logo} alt={siteInfo.name} className="h-8 w-auto" />
              <div className="hidden sm:block">
                <span className="block text-sm tracking-[0.15em] leading-none text-[#94714D]">
                  {siteInfo.name}
                </span>
                <span className="mt-0.5 block text-[10px] tracking-[0.2em] text-[#94714D]">
                  {siteInfo.tagline}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <ul className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      'text-[12px] tracking-[0.2em] uppercase transition-colors duration-200',
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
            </div>
            <div className="flex items-center gap-4">
              <a
                href={siteInfo.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#94714D]/20 bg-white/80 text-[#94714D] transition-colors hover:bg-[#94714D]/10"
                aria-label="Instagram"
              >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17" cy="7" r="1" fill="currentColor" />
              </svg>
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsOpen(true)}
              className="p-2 -mr-2 text-[var(--color-text)] md:hidden"
              aria-label="Abrir menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
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
                          'block py-3 text-[12px] tracking-[0.15em] uppercase transition-colors px-2',
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
