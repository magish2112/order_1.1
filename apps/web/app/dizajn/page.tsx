import { Metadata } from 'next'
import { ServiceCategoryPage } from '@/components/pages/service-category-page'

export const metadata: Metadata = {
  title: 'Дизайн интерьера | Создание дизайн-проектов',
  description: 'Профессиональный дизайн интерьера квартир, домов, офисов. Дизайн-проекты в различных стилях. 3D визуализация.',
  openGraph: {
    title: 'Дизайн интерьера | РемСтрой',
    description: 'Профессиональный дизайн интерьера',
  },
}

export default function DizajnPage() {
  return <ServiceCategoryPage categorySlug="dizajn" />
}

