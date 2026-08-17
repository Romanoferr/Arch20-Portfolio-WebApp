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
      'Transformar minha área de lazer em um espaço tão bonito e acolhedor foi uma experiência incrível. Desde o primeiro contato com a Bruna, percebi o carinho, a dedicação e a atenção a cada detalhe do projeto. O resultado superou minhas expectativas e traduziu exatamente o que eu sonhava para esse espaço. Sou muito grata pelo excelente trabalho e recomendo com toda a confiança!',
    author: 'Paula',
    project: 'Área Externa - Várzea das Moças',
  },
  {
    id: '2',
    quote:
      'A Bruna teve um olhar muito cuidadoso para cada detalhe da nossa casa. Conseguiu entender nossa rotina e transformar nossas necessidades em ambientes bonitos, funcionais e acolhedores. O projeto trouxe soluções que facilitaram muito o nosso dia a dia, além de deixar a casa exatamente com a nossa personalidade. Foi uma experiência incrível!',
    author: '',
    project: 'Casa - Ilha do Gorvenador',
  },
  {
    id: '3',
    quote:
      'A Bruna foi essencial para encontrar uma solução segura e eficiente para os problemas da fachada do prédio. Demonstrou muito profissionalismo em cada etapa, desde a identificação das causas do descolamento até a definição das melhores soluções. O resultado trouxe mais segurança, qualidade e valorização ao imóvel. Ficamos muito satisfeitos com o trabalho!',
    author: 'Fábio ',
    project: 'Flat Praia - Itacoatiara',
  },
]

export const featuredTestimonial = testimonials[0]
