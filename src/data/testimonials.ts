export interface Testimonial {
  id: string
  quote: string
  author: string
  project: string
}

/**
 * Depoimentos de demonstração (fictícios). Substituir pelo conteúdo real do
 * cliente no momento da instalação — ou remover o array para ocultar a seção.
 */
export const testimonials: Testimonial[] = [
  {
    id: '1',
    quote:
      'A experiência de desenvolver nosso projeto foi maravilhosa. A equipe foi sensível, detalhista e organizada, buscando soluções para adequar nossos sonhos à realidade. Conseguimos traduzir a rotina da família em um projeto que ficou lindo.',
    author: 'Cliente de Demonstração 1',
    project: 'Residência Modelo',
  },
  {
    id: '2',
    quote:
      'Transformar nosso espaço em um ambiente tão bonito e acolhedor foi uma experiência incrível. Desde o primeiro contato percebemos o carinho, a dedicação e a atenção a cada detalhe. O resultado superou nossas expectativas.',
    author: 'Cliente de Demonstração 2',
    project: 'Área de Lazer',
  },
  {
    id: '3',
    quote:
      'Conduzir a revitalização da fachada do nosso condomínio foi um processo delicado, que exigia técnica e responsabilidade. O resultado não apenas resolveu os problemas estruturais, como transformou a aparência do edifício.',
    author: 'Cliente de Demonstração 3',
    project: 'Fachada Comercial',
  },
  {
    id: '4',
    quote:
      'Profissionalismo em todas as etapas. A equipe entendeu nossas necessidades e transformou o ambiente de forma prática e funcional, com muito cuidado e atenção aos detalhes. Ficamos muito satisfeitos com o resultado.',
    author: 'Cliente de Demonstração 4',
    project: 'Escritório Modelo',
  },
]

export const featuredTestimonial = testimonials[0]
