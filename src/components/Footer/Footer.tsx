import { Link } from 'react-router-dom'
import { siteInfo } from '@/data/navigation'
import logo from '@/assets/logos/bc-logo-site.png'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#94714D] text-white/90">
      <div className="container-main py-8 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="flex items-center justify-end md:pr-6">
            <Link to="/" className="flex items-center h-16">
              <img src={logo} alt={siteInfo.name} className="h-16 w-auto filter brightness-0 invert object-contain" />
            </Link>
          </div>

          <div className="flex items-center">
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.84.36 1.66.72 2.42a2 2 0 0 1-.45 2.11L8.09 9.91a13.05 13.05 0 0 0 6 6l1.66-1.66a2 2 0 0 1 2.11-.45c.76.36 1.58.6 2.42.72A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {siteInfo.phone}
              </li>
              <li className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                  aria-hidden
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {siteInfo.email}
              </li>
              <li className="flex items-center gap-2">
                <a
                  href={siteInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
                  aria-label="Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                  <span>@brunacamara.arq</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-white/60 tracking-wide">
          © {currentYear} {siteInfo.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
