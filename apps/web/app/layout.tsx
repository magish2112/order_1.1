import type { Metadata } from 'next'
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FixedBottomBar } from '@/components/layout/fixed-bottom-bar'
import { OrganizationSchema } from '@/components/seo/structured-data'

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-sans',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: {
    default: 'Ремонтно-строительная компания | Профессиональный ремонт и дизайн',
    template: '%s | Ремонтно-строительная компания',
  },
  description: 'Профессиональный ремонт квартир, домов и офисов. Дизайн интерьеров. Гарантия качества. Выполнено более 500+ проектов.',
  keywords: ['ремонт квартир', 'дизайн интерьера', 'ремонт офисов', 'капитальный ремонт', 'евроремонт'],
  authors: [{ name: 'Ремонтно-строительная компания' }],
  creator: 'Ремонтно-строительная компания',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://example.com',
    siteName: 'Ремонтно-строительная компания',
    title: 'Ремонтно-строительная компания | Профессиональный ремонт и дизайн',
    description: 'Профессиональный ремонт квартир, домов и офисов. Дизайн интерьеров. Гарантия качества.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ремонтно-строительная компания',
    description: 'Профессиональный ремонт квартир, домов и офисов',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${manrope.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased">
        <OrganizationSchema />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FixedBottomBar />
          </div>
        </Providers>
      </body>
    </html>
  )
}

