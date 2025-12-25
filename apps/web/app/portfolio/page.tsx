import { Metadata } from 'next'
import { PortfolioPage } from '@/components/pages/portfolio-page'

export const metadata: Metadata = {
  title: 'Портфолио выполненных проектов',
  description: 'Посмотрите примеры наших работ: ремонт квартир, домов, офисов. Более 500+ успешно выполненных проектов.',
  openGraph: {
    title: 'Портфолио | РемСтрой',
    description: 'Примеры наших работ по ремонту и дизайну интерьеров',
  },
}

export default function Portfolio() {
  return <PortfolioPage />
}

