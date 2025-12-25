import { Metadata } from 'next'
import { AboutPage } from '@/components/pages/about-page'

export const metadata: Metadata = {
  title: 'О компании | РемСтрой - Профессиональный ремонт и дизайн',
  description: 'РемСтрой - ведущая компания по ремонту и дизайну интерьеров. Более 500+ выполненных проектов. Опытная команда профессионалов.',
  openGraph: {
    title: 'О компании | РемСтрой',
    description: 'О нашей компании, команде и достижениях',
  },
}

export default function About() {
  return <AboutPage />
}

