import { Metadata } from 'next'
import { FaqSection } from '@/components/sections/faq'

export const metadata: Metadata = {
  title: 'FAQ | Часто задаваемые вопросы',
  description: 'Ответы на часто задаваемые вопросы о наших услугах ремонта и строительства.',
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Часто задаваемые вопросы
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Ответы на самые распространенные вопросы о наших услугах
          </p>
        </div>

        <FaqSection />
      </div>
    </div>
  )
}
