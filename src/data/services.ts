import type { LucideIcon } from 'lucide-react'
import {Home, Scale, ChartLine, NotebookPen, PaintRoller, Hammer} from 'lucide-react'

export interface Service {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const services: Service[] = [
  {
    id: '1',
    title: 'Projetos',
    description:
      'Projetos de arquitetura, interiores, residenciais e comerciais, com soluções criativas e funcionais que refletem a identidade do cliente.',
    icon: Home,
  },
  {
    id: '2',
    title: 'Consultoria em Arquitetura e Interiores',
    description:
      'Assessoria especializada em projetos de arquitetura e interiores.',
    icon: PaintRoller, 
  },
  {
    id: '3',
    title: 'Gerenciamento de Obra',
    description:
      'Acompanhamento da execução do projeto, garantindo qualidade, prazo e orçamento, com atenção a cada detalhe da obra.',
    icon: Hammer, 
  },
  {
    id: '4',
    title: 'Legalização e Regularização',
    description:
      'Te auxilio com processos burocráticos junto a prefeituras e cartórios da sua cidade, garantindo que seu projeto esteja em conformidade com as normas e regulamentações vigentes.',
    icon: Scale,
  },
  {
    id: '5',
    title: 'Consultoria em Financiamento Imobiliário',
    description:
      'Orientação e suporte em processos de financiamento, auxiliando na análise de viabilidade, documentação e negociação com instituições financeiras.',
    icon: ChartLine,
  },
  {
    id: '6',
    title: 'Avaliação de Imóveis',
    description:
      'Análise técnica baseada na NBR 14.653-2, que te auxilia na compra, venda e trâmites judiciais, garantindo uma avaliação justa e precisa do imóvel.',
    icon: NotebookPen,
  },
]
