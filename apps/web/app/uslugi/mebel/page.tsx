import { Metadata } from 'next'
import { getServicePageContent } from '@/lib/service-pages'
import { UslugiPageContent } from '@/components/pages/uslugi-page-content'

const DEFAULT_META = {
  title: 'Мебель | Изготовление и установка мебели на заказ',
  description: 'Изготовление и установка мебели на заказ. Корпусная мебель, встроенная мебель, мебель для офиса и дома.',
}

const DEFAULT_HERO = {
  title: 'Мебель на заказ',
  subtitle: 'Изготовление и установка мебели по индивидуальным проектам',
}

const DEFAULT_BODY = (
  <div className="space-y-10 text-foreground">
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Мебель на заказ</h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Мы предлагаем полный цикл производства мебели: от разработки дизайн-проекта до монтажа и установки.
      </p>
      <p className="leading-relaxed text-muted-foreground">
        Создаём функциональную и стильную мебель, которая идеально впишется в ваш интерьер и будет служить годами.
      </p>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Виды мебели</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Корпусная мебель (кухни, шкафы, гардеробные)</li>
        <li>Встроенная мебель</li>
        <li>Мебель для спальни</li>
        <li>Мебель для гостиной</li>
        <li>Офисная мебель</li>
        <li>Мебель для детских комнат</li>
      </ul>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Наши преимущества</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Индивидуальный подход к каждому проекту</li>
        <li>Высококачественные материалы</li>
        <li>Современное оборудование</li>
        <li>Профессиональная сборка и установка</li>
        <li>Гарантия на всю продукцию</li>
      </ul>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Этапы работы</h3>
      <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
        <li>Консультация и замеры</li>
        <li>Разработка дизайн-проекта</li>
        <li>Согласование и утверждение</li>
        <li>Изготовление мебели</li>
        <li>Доставка и монтаж</li>
      </ol>
    </div>
  </div>
)

export async function generateMetadata(): Promise<Metadata> {
  const data = await getServicePageContent('mebel')
  return {
    title: data?.metaTitle || DEFAULT_META.title,
    description: data?.metaDescription || DEFAULT_META.description,
    openGraph: {
      title: data?.metaTitle || 'Мебель на заказ | ETERNO STROY',
      description: data?.metaDescription || DEFAULT_META.description,
    },
  }
}

export default async function MebelPage() {
  const data = await getServicePageContent('mebel')
  return (
    <UslugiPageContent
      heroTitle={data?.heroTitle ?? DEFAULT_HERO.title}
      heroSubtitle={data?.heroSubtitle ?? DEFAULT_HERO.subtitle}
      customHtml={data?.content}
      defaultBody={DEFAULT_BODY}
    />
  )
}
