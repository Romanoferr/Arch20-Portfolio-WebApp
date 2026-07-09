import type { LucideIcon } from 'lucide-react'
import { Building2, Home, LayoutGrid, PenTool, Ruler, Trees } from 'lucide-react'

export interface Service {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const services: Service[] = [
  {
    id: '1',
    title: 'Arquitetura Residencial',
    description:
      'Projetos de casas e apartamentos que traduzem o estilo de vida dos moradores em espaços funcionais e acolhedores.',
    icon: Home,
  },
  {
    id: '2',
    title: 'Arquitetura Comercial',
    description:
      'Escritórios, lojas e espaços corporativos projetados para fortalecer a identidade da marca e a experiência do usuário.',
    icon: Building2,
  },
  {
    id: '3',
    title: 'Design de Interiores',
    description:
      'Ambientação completa com seleção de materiais, mobiliário sob medida e iluminação para cada detalhe do espaço.',
    icon: LayoutGrid,
  },
  {
    id: '4',
    title: 'Reformas e Retrofit',
    description:
      'Revitalização de imóveis existentes com soluções criativas que respeitam a estrutura original e ampliam o conforto.',
    icon: Ruler,
  },
  {
    id: '5',
    title: 'Paisagismo',
    description:
      'Integração entre arquitetura e natureza, com jardins, terraços e áreas externas que complementam o projeto.',
    icon: Trees,
  },
  {
    id: '6',
    title: 'Consultoria e Acompanhamento',
    description:
      'Orientação em todas as etapas — do conceito à obra — garantindo que cada decisão esteja alinhada ao projeto.',
    icon: PenTool,
  },
]
