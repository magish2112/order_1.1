import { Metadata } from 'next'
import { ServiceCategoryPage } from '@/components/pages/service-category-page'

export const metadata: Metadata = {
  title: 'Ремонт квартир и домов | Профессиональный ремонт',
  description: 'Комплексный ремонт квартир, домов, новостроек и вторичного жилья. Капитальный, дизайнерский, элитный ремонт. Гарантия качества.',
  openGraph: {
    title: 'Ремонт | РемСтрой',
    description: 'Профессиональный ремонт квартир и домов',
  },
}

export default function RemontPage() {
  return <ServiceCategoryPage categorySlug="remont" />
}

