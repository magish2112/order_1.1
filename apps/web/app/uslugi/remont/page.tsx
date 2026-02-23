import { Metadata } from 'next'
import { getServicePageContent } from '@/lib/service-pages'
import { UslugiPageContent } from '@/components/pages/uslugi-page-content'

const DEFAULT_META = {
  title: 'Ремонт квартир и домов | Профессиональный ремонт',
  description: 'Комплексный ремонт квартир, домов, новостроек и вторичного жилья. Капитальный, дизайнерский, элитный ремонт. Гарантия качества.',
}

const DEFAULT_HERO = {
  title: 'Ремонт квартир и домов',
  subtitle: 'Профессиональный ремонт под ключ: от черновой отделки до сдачи под ключ',
}

const DEFAULT_BODY = (
  <div className="space-y-10 text-foreground">
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Комплексный ремонт под ключ</h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Мы выполняем полный спектр ремонтных работ: от косметического обновления до капитального ремонта квартир, домов, новостроек и вторичного жилья.
      </p>
      <p className="leading-relaxed text-muted-foreground">
        Соблюдаем сроки, даём гарантию на работы и используем только проверенные материалы. Результат — уютное и долговечное жильё.
      </p>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Виды ремонта</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Косметический ремонт (покраска, обои, замена покрытий)</li>
        <li>Капитальный ремонт (перепланировка, замена инженерных систем)</li>
        <li>Дизайнерский ремонт (авторский надзор, премиальные материалы)</li>
        <li>Ремонт новостроек и вторичного жилья</li>
        <li>Отделка офисов и коммерческих помещений</li>
      </ul>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Почему выбирают нас</h3>
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Опытные бригады и прорабы</li>
        <li>Честная смета без скрытых доплат</li>
        <li>Гарантия на все виды работ</li>
        <li>Соблюдение сроков по договору</li>
        <li>Контроль качества на каждом этапе</li>
      </ul>
    </div>
    <div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">Как мы работаем</h3>
      <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
        <li>Выезд замерщика и составление сметы</li>
        <li>Заключение договора и согласование этапов</li>
        <li>Черновые и отделочные работы</li>
        <li>Сдача объекта и гарантийное обслуживание</li>
      </ol>
    </div>
  </div>
)

export async function generateMetadata(): Promise<Metadata> {
  const data = await getServicePageContent('remont')
  return {
    title: data?.metaTitle || DEFAULT_META.title,
    description: data?.metaDescription || DEFAULT_META.description,
    openGraph: {
      title: data?.metaTitle || 'Ремонт | ETERNO STROY',
      description: data?.metaDescription || DEFAULT_META.description,
    },
  }
}

export default async function RemontPage() {
  const data = await getServicePageContent('remont')
  return (
    <UslugiPageContent
      heroTitle={data?.heroTitle ?? DEFAULT_HERO.title}
      heroSubtitle={data?.heroSubtitle ?? DEFAULT_HERO.subtitle}
      customHtml={data?.content}
      defaultBody={DEFAULT_BODY}
    />
  )
}
