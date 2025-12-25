import { Metadata } from 'next'
import { ContactsPage } from '@/components/pages/contacts-page'

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с нами: телефон, email, адрес офиса. Работаем ежедневно с 9:00 до 21:00.',
  openGraph: {
    title: 'Контакты | РемСтрой',
    description: 'Наши контакты и как с нами связаться',
  },
}

export default function Contacts() {
  return <ContactsPage />
}

