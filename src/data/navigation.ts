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
  name: 'Bruna Câmara',
  tagline: 'Arquitetura & Design de Interiores',
  email: 'camarabruna.arq@gmail.com',
  phone: '+55 (21) 98533-0175',
  instagram: 'https://instagram.com/brunacamara.arq'
}
