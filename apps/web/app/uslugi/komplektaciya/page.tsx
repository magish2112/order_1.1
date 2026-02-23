import { Metadata } from 'next'
import { getServicePageContent } from '@/lib/service-pages'
import { UslugiPageContent } from '@/components/pages/uslugi-page-content'

const DEFAULT_META = {
  title: 'Комплектация | Полная комплектация объектов',
  description: 'Полная комплектация строительных объектов материалами и оборудованием. Поставка и монтаж инженерных систем.',
}

const DEFAULT_HERO = {
  title: 'Комплектация',
  subtitle: 'Полная комплектация строительных объектов материалами и оборудованием',
}

const DEFAULT_BODY = (
  <div className="space-y-10 text-foreground">
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Полная комплектация объектов</h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Мы осуществляем комплексную комплектацию строительных объектов всеми необходимыми материалами, оборудованием и инженерными системами.
      </p>
      <p className="leading-relaxed text-muted-foreground">
        Наша служба комплектации гарантирует своевременную поставку качественных материалов от проверенных производителей и контроль соответствия проекту.
      </p>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Наши услуги по комплектации</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Подбор и поставка строительных материалов</li>
        <li>Комплектация инженерных систем</li>
        <li>Поставка сантехнического оборудования</li>
        <li>Комплектация электрики и освещения</li>
        <li>Поставка отделочных материалов</li>
        <li>Логистика и хранение материалов</li>
      </ul>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Преимущества работы с нами</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Прямые поставки от производителей</li>
        <li>Сертифицированные материалы</li>
        <li>Своевременная доставка</li>
        <li>Консультации специалистов</li>
        <li>Гибкие условия оплаты</li>
      </ul>
    </div>
  </div>
)

export async function generateMetadata(): Promise<Metadata> {
  const data = await getServicePageContent('komplektaciya')
  return {
    title: data?.metaTitle || DEFAULT_META.title,
    description: data?.metaDescription || DEFAULT_META.description,
    openGraph: {
      title: data?.metaTitle || 'Комплектация | ETERNO STROY',
      description: data?.metaDescription || DEFAULT_META.description,
    },
  }
}

export default async function KomplektaciyaPage() {
  const data = await getServicePageContent('komplektaciya')
  return (
    <UslugiPageContent
      heroTitle={data?.heroTitle ?? DEFAULT_HERO.title}
      heroSubtitle={data?.heroSubtitle ?? DEFAULT_HERO.subtitle}
      customHtml={data?.content}
      defaultBody={DEFAULT_BODY}
    />
  )
}
