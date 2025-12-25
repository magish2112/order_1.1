import { Metadata } from 'next'
import { VacanciesPage } from '@/components/pages/vacancies-page'

export const metadata: Metadata = {
  title: 'Вакансии | РемСтрой - Присоединяйтесь к команде',
  description: 'Открытые вакансии в РемСтрой. Присоединяйтесь к команде профессионалов по ремонту и дизайну интерьеров.',
  openGraph: {
    title: 'Вакансии | РемСтрой',
    description: 'Работа в РемСтрой - присоединяйтесь к команде',
  },
}

export default function Vacancies() {
  return <VacanciesPage />
}

