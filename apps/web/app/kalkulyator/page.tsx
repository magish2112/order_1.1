import { Metadata } from 'next'
import { CalculatorPage } from '@/components/pages/calculator-page'

export const metadata: Metadata = {
  title: 'Калькулятор стоимости ремонта',
  description: 'Рассчитайте примерную стоимость ремонта вашей квартиры, дома или офиса онлайн. Быстрый и точный расчет за несколько минут.',
  openGraph: {
    title: 'Калькулятор стоимости ремонта | РемСтрой',
    description: 'Онлайн калькулятор для расчета стоимости ремонта',
  },
}

export default function CalculatorPageRoute() {
  return <CalculatorPage />
}

