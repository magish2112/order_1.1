import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Мебель | Изготовление и установка мебели на заказ',
  description: 'Изготовление и установка мебели на заказ. Корпусная мебель, встроенная мебель, мебель для офиса и дома.',
  openGraph: {
    title: 'Мебель на заказ | РемСтрой',
    description: 'Изготовление и установка мебели на заказ',
  },
}

export default function MebelPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Мебель на заказ
          </h1>
          <p className="mt-4 text-xl text-green-100">
            Изготовление и установка мебели по индивидуальным проектам
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>Мебель на заказ</h2>
            <p>
              Мы предлагаем полный цикл производства мебели: от разработки дизайн-проекта до монтажа
              и установки. Создаем функциональную и стильную мебель, которая идеально впишется в ваш интерьер.
            </p>

            <h3>Виды мебели:</h3>
            <ul>
              <li>Корпусная мебель (кухни, шкафы, гардеробные)</li>
              <li>Встроенная мебель</li>
              <li>Мебель для спальни</li>
              <li>Мебель для гостиной</li>
              <li>Офисная мебель</li>
              <li>Мебель для детских комнат</li>
            </ul>

            <h3>Наши преимущества:</h3>
            <ul>
              <li>Индивидуальный подход к каждому проекту</li>
              <li>Высококачественные материалы</li>
              <li>Современное оборудование</li>
              <li>Профессиональная сборка и установка</li>
              <li>Гарантия на всю продукцию</li>
            </ul>

            <h3>Этапы работы:</h3>
            <ol>
              <li>Консультация и замеры</li>
              <li>Разработка дизайн-проекта</li>
              <li>Согласование и утверждение</li>
              <li>Изготовление мебели</li>
              <li>Доставка и монтаж</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}