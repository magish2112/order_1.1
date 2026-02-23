import { Metadata } from 'next'
import { getServicePageContent } from '@/lib/service-pages'
import { UslugiPageContent } from '@/components/pages/uslugi-page-content'

const DEFAULT_META = {
  title: 'Дизайн интерьера | Создание дизайн-проектов',
  description: 'Профессиональный дизайн интерьера квартир, домов, офисов. Дизайн-проекты в различных стилях. 3D визуализация.',
}

const DEFAULT_HERO = {
  title: 'Дизайн интерьера',
  subtitle: 'Создание дизайн-проектов и визуализация для квартир, домов и офисов',
}

const DEFAULT_BODY = (
  <div className="space-y-10 text-foreground">
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Дизайн-проект под ваш интерьер</h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Мы разрабатываем дизайн интерьера для жилых и коммерческих помещений: от эскизов и планировок до подбора материалов и 3D-визуализации.
      </p>
      <p className="leading-relaxed text-muted-foreground">
        Проект помогает избежать ошибок при ремонте, заранее увидеть результат и уложиться в бюджет за счёт точного расчёта материалов и работ.
      </p>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Что входит в дизайн-проект</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Обмеры и планировочные решения</li>
        <li>Стилистика и подбор отделочных материалов</li>
        <li>Планировка освещения и электрики</li>
        <li>3D-визуализация ключевых зон</li>
        <li>Спецификации и смета по материалам</li>
        <li>Авторский надзор при реализации (по желанию)</li>
      </ul>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Стили и направления</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Современный и минимализм</li>
        <li>Скандинавский и лофт</li>
        <li>Классика и неоклассика</li>
        <li>Кантри и эко-стиль</li>
        <li>Индивидуальные комбинации под ваш вкус</li>
      </ul>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Этапы работы</h3>
      <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
        <li>Бриф, выезд на объект и обмеры</li>
        <li>Концепция и планировка</li>
        <li>Визуализация и подбор материалов</li>
        <li>Утверждение проекта и выдача рабочей документации</li>
      </ol>
    </div>
  </div>
)

export async function generateMetadata(): Promise<Metadata> {
  const data = await getServicePageContent('dizajn')
  return {
    title: data?.metaTitle || DEFAULT_META.title,
    description: data?.metaDescription || DEFAULT_META.description,
    openGraph: {
      title: data?.metaTitle || 'Дизайн интерьера | ETERNO STROY',
      description: data?.metaDescription || DEFAULT_META.description,
    },
  }
}

export default async function DizajnPage() {
  const data = await getServicePageContent('dizajn')
  return (
    <UslugiPageContent
      heroTitle={data?.heroTitle ?? DEFAULT_HERO.title}
      heroSubtitle={data?.heroSubtitle ?? DEFAULT_HERO.subtitle}
      customHtml={data?.content}
      defaultBody={DEFAULT_BODY}
    />
  )
}
