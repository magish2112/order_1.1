'use client'

import { AnimatedButton } from '@/components/ui/animated-button'

export default function TestAnimatedButtonsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Анимированные кнопки
          </h1>
          <p className="text-gray-600">
            Примеры использования анимированных кнопок с эффектом заполнения
          </p>
        </div>

        <div className="space-y-12">
          {/* Варианты цветов */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Варианты цветов
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <AnimatedButton variant="default">
                Purple (Default)
              </AnimatedButton>
              <AnimatedButton variant="primary">
                Primary
              </AnimatedButton>
              <AnimatedButton variant="secondary">
                Secondary
              </AnimatedButton>
              <AnimatedButton variant="success">
                Success
              </AnimatedButton>
              <AnimatedButton variant="danger">
                Danger
              </AnimatedButton>
            </div>
          </section>

          {/* Как ссылки */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Как ссылки
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <AnimatedButton href="/" variant="primary">
                Главная
              </AnimatedButton>
              <AnimatedButton href="/portfolio" variant="primary">
                Портфолио
              </AnimatedButton>
              <AnimatedButton href="/kontakty" variant="primary">
                Контакты
              </AnimatedButton>
              <AnimatedButton href="/kalkulyator" variant="success">
                Калькулятор
              </AnimatedButton>
            </div>
          </section>

          {/* Как кнопки */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Как кнопки (с обработчиками)
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <AnimatedButton
                variant="primary"
                onClick={() => alert('Кнопка нажата!')}
              >
                Заказать звонок
              </AnimatedButton>
              <AnimatedButton
                variant="success"
                onClick={() => console.log('Рассчитать стоимость')}
              >
                Рассчитать стоимость
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                onClick={() => alert('Отправить заявку')}
              >
                Отправить заявку
              </AnimatedButton>
            </div>
          </section>

          {/* Кастомные стили */}
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              С кастомными классами
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <AnimatedButton
                variant="primary"
                className="text-lg px-8 py-3"
              >
                Большая кнопка
              </AnimatedButton>
              <AnimatedButton
                variant="default"
                className="text-sm px-4 py-1.5"
              >
                Маленькая кнопка
              </AnimatedButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

