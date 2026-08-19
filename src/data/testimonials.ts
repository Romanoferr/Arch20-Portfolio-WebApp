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
      'Minha experiência no desenvolvimento do projeto foi maravilhosa! Eu nunca havia feito nenhum trabalho com arquiteto, foi a minha primeira experiência e valeu todo o investimento. A Bruna é uma profissional super sensível, detalhista, organizada, busca soluções para adequar nossos sonhos a realidade do projeto, ela conseguiu traduzir a rotina da família e a personalidade de cada um no projeto da casa, ficou lindo demais. Queria destacar também a entrega um momento a parte, ela explica cada detalhe do projeto e a gente ainda recebe mimos!! A experiência foi tão boa que eu não queria que acabasse, ela é muito segura e transmite essa segurança em cada detalhe do projeto! Obrigada Bruna por fazer meu sonho se tornar realidade!! 🥰',
    author: 'Luciana e Josemar',
    project: 'Casa Ilha',
  },
  {
    id: '2',
    quote:
      'Transformar minha área de lazer em um espaço tão bonito e acolhedor foi uma experiência incrível. Desde o primeiro contato com a Bruna, percebi o carinho, a dedicação e a atenção a cada detalhe do projeto. O resultado superou minhas expectativas e traduziu exatamente o que eu sonhava para esse espaço. Sou muito grata pelo excelente trabalho e recomendo com toda a confiança!',
    author: 'Paula e Flávio',
    project: 'Área Externa PF',
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
