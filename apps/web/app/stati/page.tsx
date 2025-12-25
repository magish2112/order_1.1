import { Metadata } from 'next'
import { ArticlesPage } from '@/components/pages/articles-page'

export const metadata: Metadata = {
  title: 'Статьи и полезные материалы',
  description: 'Полезные статьи о ремонте, дизайне интерьеров и строительстве. Советы от профессионалов.',
  openGraph: {
    title: 'Статьи | РемСтрой',
    description: 'Полезные статьи о ремонте и дизайне',
  },
}

export default function Articles() {
  return <ArticlesPage />
}

