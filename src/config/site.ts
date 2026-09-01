/**
 * Configuração central do site do cliente.
 *
 * Este é o ÚNICO lugar onde a identidade do cliente deve ser editada.
 * Substitua TODOS os valores pelos do novo cliente. Campos vazios fazem o
 * componente correspondente omitir a informação (ex.: o botão de WhatsApp só
 * renderiza se `contact.whatsapp` estiver preenchido; o Instagram só aparece
 * se `social.instagram` estiver preenchido).
 *
 * O conteúdo editável da aplicação (serviços, depoimentos) fica em `src/data/`.
 * A navegação fixa (links do menu) também fica em `src/data/navigation.ts`.
 */
export const siteConfig = {
  /** Nome do escritório (ex.: "Arquitetura & Design"). Usado no Navbar, Footer, SEO e JSON-LD. */
  name: 'Nome do Escritório',
  /** Slogan/tagline curta exibida sob o nome no Navbar. */
  tagline: 'Arquitetura & Design de Interiores',
  /** Descrição institucional usada como meta description padrão e no SEO. */
  description: 'Portfólio de arquitetura e design de interiores.',

  contact: {
    email: '',
    phone: '',
    whatsapp: '',
  },

  social: {
    instagram: '',
    linkedin: '',
    facebook: '',
  },

  address: {
    street: '',
    city: '',
    state: '',
    country: '',
  },
}