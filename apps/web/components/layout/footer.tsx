import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Send } from 'lucide-react'
import { Boxes } from '@/components/ui/background-boxes'
import { getApiUrl } from '@/lib/api'

const footerLinks = {
  services: [
    { name: 'Ремонт квартир', href: '/remont/kvartiry' },
    { name: 'Дизайн интерьера', href: '/dizajn' },
    { name: 'Ремонт домов', href: '/uslugi/doma' },
    { name: 'Ремонт офисов', href: '/uslugi/ofisy' },
  ],
  company: [
    { name: 'О компании', href: '/o-kompanii' },
    { name: 'Портфолио', href: '/portfolio' },
    { name: 'Статьи', href: '/stati' },
    { name: 'Вакансии', href: '/vakansii' },
  ],
  info: [
    { name: 'Калькулятор', href: '/kalkulyator' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Контакты', href: '/kontakty' },
    { name: 'Политика конфиденциальности', href: '/privacy-policy' },
  ],
}

export async function Footer() {
  let logoUrl = '/logo.svg'
  try {
    const response = await fetch(getApiUrl('/settings/public'), {
      next: { revalidate: 300 },
    })
    if (response.ok) {
      const payload = (await response.json()) as { success?: boolean; data?: Record<string, unknown> }
      const settings = payload.data || {}
      logoUrl = (settings.logo as string) || logoUrl
    }
  } catch {
    // используем fallback logo
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000'
  const resolvedLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${apiBase}${logoUrl}`

  return (
    <footer className="relative bg-background text-foreground overflow-hidden border-t border-border">
      {/* Industrial Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-accent/10 to-transparent blur-2xl" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-accent/10 to-transparent blur-2xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-4 group">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <Image
                  src={resolvedLogoUrl}
                  alt="ETERNO STROY"
                  width={48}
                  height={48}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  unoptimized={resolvedLogoUrl.startsWith('http')}
                />
              </div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </Link>
            <p className="mb-4 text-sm text-accent font-medium">
              Строительная компания №1 в Москве
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Профессиональное строительство и ремонт. Качество, надежность, соблюдение сроков. Более 15 лет на рынке.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center">
              <div className="w-1 h-6 bg-accent mr-3"></div>
              Услуги
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-accent transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center">
              <div className="w-1 h-6 bg-accent mr-3"></div>
              Компания
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-accent transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center">
              <div className="w-1 h-6 bg-accent mr-3"></div>
              Контакты
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Phone className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">+7 (999) 123-45-67</p>
                  <p className="text-xs text-muted-foreground">Ежедневно 9:00 - 21:00</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <a
                  href="mailto:info@remstroy.ru"
                  className="text-sm text-foreground hover:text-accent transition-colors"
                >
                  info@remstroy.ru
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm text-foreground">
                  г. Москва, ул. Примерная, д. 1
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ETERNO STROY. Все права защищены.
            </p>
            <div className="flex space-x-6">
              {footerLinks.info.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Создано для профессионалов строительства
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
