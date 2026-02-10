import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Send } from 'lucide-react'
import { Boxes } from '@/components/ui/background-boxes'
import { getApiUrl } from '@/lib/api'

const footerLinks = {
  company: [
    { name: 'О компании', href: '/o-kompanii' },
    { name: 'Портфолио', href: '/portfolio' },
    { name: 'Статьи', href: '/stati' },
    { name: 'Вакансии', href: '/vakansii' },
  ],
  services: [
    { name: 'Ремонт', href: '/uslugi/remont' },
    { name: 'Дизайн', href: '/uslugi/dizajn' },
    { name: 'Комплектация', href: '/uslugi/komplektaciya' },
    { name: 'Мебель', href: '/uslugi/mebel' },
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
  let settings: Record<string, unknown> = {}
  
  try {
    const response = await fetch(getApiUrl('/settings/public'), {
      next: { revalidate: 300 },
    })
    if (response.ok) {
      const payload = (await response.json()) as { success?: boolean; data?: Record<string, unknown> }
      settings = payload.data || {}
      logoUrl = (settings.logo as string) || logoUrl
    }
  } catch {
    // используем fallback настройки
  }

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ''
  const resolvedLogoUrl = logoUrl.startsWith('http')
    ? logoUrl
    : siteBase && !siteBase.includes('localhost')
      ? `${siteBase.replace(/\/$/, '')}${logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl}`
      : logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl
  
  // Извлекаем настройки с fallback значениями
  const phone = (settings.phone as string) || '+7 (999) 123-45-67'
  const email = (settings.email as string) || 'info@eternostroy.ru'
  const address = (settings.address as string) || 'г. Москва, ул. Примерная, д. 1'
  const workHours = (settings.workHours as string) || 'Ежедневно 9:00 - 21:00'
  const vk = (settings.vk as string) || '#'
  const telegram = (settings.telegram as string) || '#'
  const youtube = (settings.youtube as string) || '#'
  const whatsapp = (settings.whatsapp as string) || '#'

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
              {vk && vk !== '#' && (
                <a
                  href={vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                  aria-label="VK"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.45 14.24c-.32.39-.98.81-1.68.81h-1.19c-.66 0-.86-.28-1.8-1.22-.91-.9-1.31-1.03-1.54-1.03-.31 0-.4.09-.4.53v1.11c0 .3-.1.48-1.04.48-1.54 0-3.25-.93-4.45-2.66-1.8-2.58-2.29-4.52-2.29-4.91 0-.23.09-.44.53-.44h1.19c.4 0 .55.18.7.61.79 2.22 2.11 4.15 2.65 4.15.2 0 .3-.09.3-.6v-2.33c-.07-.99-.58-1.08-.58-1.43 0-.18.15-.36.4-.36h1.87c.33 0 .46.18.46.57v3.16c0 .33.15.46.24.46.2 0 .36-.13.73-.5 1.14-1.28 1.95-3.25 1.95-3.25.11-.23.28-.44.7-.44h1.19c.42 0 .51.22.42.57-.15.83-1.89 3.51-1.89 3.51-.16.26-.21.38 0 .67.14.21.63.62 .95 1 .59.67 1.05 1.23 1.17 1.62.12.38-.07.57-.49.57z"/>
                  </svg>
                </a>
              )}
              {youtube && youtube !== '#' && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {telegram && telegram !== '#' && (
                <a
                  href={telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                  aria-label="Telegram"
                >
                  <Send className="h-5 w-5" />
                </a>
              )}
              {whatsapp && whatsapp !== '#' && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-muted"
                  aria-label="WhatsApp"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              )}
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

          {/* Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center">
              <div className="w-1 h-6 bg-accent mr-3"></div>
              Информация
            </h3>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
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
                  <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                    {phone}
                  </a>
                  <p className="text-xs text-muted-foreground">{workHours}</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-foreground hover:text-accent transition-colors"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm text-foreground">
                  {address}
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ETERNO STROY. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
