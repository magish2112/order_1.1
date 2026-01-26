import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика конфиденциальности и обработки персональных данных.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-accent transition-colors mb-8 inline-block"
        >
          ← На главную
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Политика конфиденциальности
        </h1>
        <p className="mt-2 text-muted-foreground">
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </p>

        <div className="mt-12 prose prose-invert max-w-none text-foreground/90 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Общие положения</h2>
            <p>
              Настоящая политика конфиденциальности определяет порядок обработки и защиты
              персональных данных пользователей сайта. Использование сайта означает согласие
              с данной политикой.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Собираемые данные</h2>
            <p>
              При заполнении форм заявки, обратного звонка или контактов мы можем запрашивать:
              имя, номер телефона, адрес электронной почты и иные сведения, необходимые для
              связи и оказания услуг.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Использование данных</h2>
            <p>
              Персональные данные используются исключительно для обработки заявок, связи
              с клиентами и улучшения качества обслуживания. Мы не передаём данные третьим
              лицам без вашего согласия, за исключением случаев, предусмотренных законом.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Контакты</h2>
            <p>
              По вопросам, связанным с обработкой персональных данных, вы можете обратиться
              через раздел <Link href="/kontakty" className="text-accent hover:underline">Контакты</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
