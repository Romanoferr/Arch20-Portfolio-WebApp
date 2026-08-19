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
    project: 'Área Externa PF',
  },
  {
    id: '2',
    quote:
      'Quanto cuidado num projeto só, um olhar todo especial para pessoas, onde a criança teve voz. Identifico claramente a personalidade delas em cada detalhe.',
    author: 'Luciana',
    project: 'Casa Ilha',
  },
  {
    id: '3',
    quote:
      'Conduzir a revitalização da fachada do nosso condomínio foi um processo delicado, que exigia técnica, sensibilidade e muita responsabilidade. Desde o primeiro contato com a Bruna, sentimos o cuidado com cada detalhe do projeto, da escolha dos materiais e das cores até as soluções que garantiriam mais segurança e acessibilidade para os moradores. O resultado não apenas resolveu os problemas estruturais que enfrentávamos, como transformou a aparência do edifício, trazendo um novo brilho e devolvendo aos condôminos o orgulho de morar aqui. Sou muito grato pelo trabalho sério e competente da Bruna e recomendo com toda confiança.',
    author: 'Fábio ',
    project: 'Flat Praia Itacoatiara',
  },
  {id: '4',
    quote:
      'A Bruna foi extremamente profissional durante todo o projeto, entendendo nossas necessidades e transformando o ambiente de forma prática e funcional. Demonstrou muito cuidado em cada escolha e atenção aos detalhes, sempre buscando as melhores soluções para o espaço. Ficamos muito satisfeitos com o resultado e com todo o profissionalismo demonstrado durante o processo.',
    author: 'André',
    project: 'Escritório SBA',
  },
]

export const featuredTestimonial = testimonials[0]
