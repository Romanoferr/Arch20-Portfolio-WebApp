export interface NavLink {
  label: string
  path: string
}

export const navLinks: NavLink[] = [
  { label: 'Início', path: '/' },
  { label: 'Projetos', path: '/projetos/' },
  { label: 'Serviços', path: '/servicos/' },
  { label: 'Sobre', path: '/sobre/' },
  { label: 'Contato', path: '/contato/' },
]

/**
 * Identidade/contato do escritório ficam centralizados em `src/config/site.ts`
 * (siteConfig). Esta pasta contém apenas conteúdo/navegação editável:
 *   - navigation.ts  → links do menu
 *   - services.ts    → serviços prestados
 *   - testimonials.ts→ depoimentos
 *   - projects.ts    → reexporta o serviço de projetos (banco)
 */
