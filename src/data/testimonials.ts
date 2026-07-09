export interface Testimonial {
  id: string
  quote: string
  author: string
  project: string
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    quote:
      'O Estúdio Forma transformou nossa casa em um refúgio. Cada detalhe foi pensado com cuidado e o resultado superou todas as expectativas.',
    author: 'Mariana e Ricardo Alves',
    project: 'Casa Jardim Europa',
  },
  {
    id: '2',
    quote:
      'Profissionalismo impecável do primeiro esboço à entrega. Nosso escritório ficou exatamente como imaginávamos — funcional e inspirador.',
    author: 'Carlos Mendes, CEO',
    project: 'Escritório Avenida',
  },
  {
    id: '3',
    quote:
      'A sensibilidade no tratamento dos materiais e da luz fez toda a diferença no nosso loft. Recomendo de olhos fechados.',
    author: 'Juliana Costa',
    project: 'Loft Pinheiros',
  },
]

export const featuredTestimonial = testimonials[0]
