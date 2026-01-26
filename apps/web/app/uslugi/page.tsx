import { Metadata } from 'next'
import { ServiceCategoryPage } from '@/components/pages/service-category-page'

export const metadata: Metadata = {
  title: 'Прочие услуги | Ремонт домов, офисов, коттеджей',
  description: 'Ремонт и отделка домов, коттеджей, апартаментов, офисов и ресторанов. Профессиональное выполнение под ключ.',
  openGraph: {
    title: 'Прочие услуги | Ремонт домов и офисов',
    description: 'Ремонт домов, коттеджей, офисов и коммерческих помещений.',
  },
}

export default function UslugiPage() {
  return <ServiceCategoryPage categorySlug="uslugi" />
}
