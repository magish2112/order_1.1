import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Комплектация | Полная комплектация объектов',
  description: 'Полная комплектация строительных объектов материалами и оборудованием. Поставка и монтаж инженерных систем.',
  openGraph: {
    title: 'Комплектация | РемСтрой',
    description: 'Полная комплектация строительных объектов',
  },
}

export default function KomplektaciyaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Комплектация
          </h1>
          <p className="mt-4 text-xl text-blue-100">
            Полная комплектация строительных объектов материалами и оборудованием
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>Полная комплектация объектов</h2>
            <p>
              Мы осуществляем комплексную комплектацию строительных объектов всеми необходимыми материалами,
              оборудованием и инженерными системами. Наша служба комплектации гарантирует своевременную поставку
              качественных материалов от проверенных производителей.
            </p>

            <h3>Наши услуги по комплектации:</h3>
            <ul>
              <li>Подбор и поставка строительных материалов</li>
              <li>Комплектация инженерных систем</li>
              <li>Поставка сантехнического оборудования</li>
              <li>Комплектация электрики и освещения</li>
              <li>Поставка отделочных материалов</li>
              <li>Логистика и хранение материалов</li>
            </ul>

            <h3>Преимущества работы с нами:</h3>
            <ul>
              <li>Прямые поставки от производителей</li>
              <li>Сертифицированные материалы</li>
              <li>Своевременная доставка</li>
              <li>Консультации специалистов</li>
              <li>Гибкие условия оплаты</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}