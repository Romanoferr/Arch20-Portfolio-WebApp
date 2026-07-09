export interface NavLink {
  label: string
  path: string
}

export const navLinks: NavLink[] = [
  { label: 'Início', path: '/' },
  { label: 'Projetos', path: '/projetos' },
  { label: 'Serviços', path: '/servicos' },
  { label: 'Sobre', path: '/sobre' },
  { label: 'Contato', path: '/contato' },
]

export const siteInfo = {
  name: 'Estúdio Forma',
  tagline: 'Arquitetura & Interiores',
  email: 'contato@estudioforma.com.br',
  phone: '+55 (11) 98765-4321',
  address: 'Rua Oscar Freire, 1200 — São Paulo, SP',
  instagram: 'https://instagram.com',
  linkedin: 'https://linkedin.com',
  pinterest: 'https://pinterest.com',
}
