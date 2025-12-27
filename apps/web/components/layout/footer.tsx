import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Send } from 'lucide-react'
import { Boxes } from '@/components/ui/background-boxes'

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

export function Footer() {
  return (
    <footer className="relative bg-zinc-950 text-zinc-300 overflow-hidden border-t border-zinc-800">
      {/* Industrial Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(63, 63, 70) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(63, 63, 70) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-amber-600/10 to-transparent blur-2xl" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-orange-600/10 to-transparent blur-2xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <span className="text-2xl font-bold text-white">
                РемСтрой
              </span>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </Link>
            <p className="mb-4 text-sm text-amber-500 font-medium">
              Строительная компания №1 в Москве
            </p>
            <p className="mb-4 text-sm">
              Профессиональное строительство и ремонт. Качество, надежность, соблюдение сроков. Более 15 лет на рынке.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-zinc-400 hover:text-amber-500 transition-colors p-2 rounded-lg hover:bg-zinc-900"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-amber-500 transition-colors p-2 rounded-lg hover:bg-zinc-900"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-amber-500 transition-colors p-2 rounded-lg hover:bg-zinc-900"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-amber-500 transition-colors p-2 rounded-lg hover:bg-zinc-900"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white flex items-center">
              <div className="w-1 h-6 bg-amber-500 mr-3"></div>
              Услуги
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-amber-500 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-500 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white flex items-center">
              <div className="w-1 h-6 bg-amber-500 mr-3"></div>
              Компания
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-amber-500 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-500 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white flex items-center">
              <div className="w-1 h-6 bg-amber-500 mr-3"></div>
              Контакты
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-zinc-900 rounded-lg">
                  <Phone className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">+7 (999) 123-45-67</p>
                  <p className="text-xs text-zinc-500">Ежедневно 9:00 - 21:00</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-zinc-900 rounded-lg">
                  <Mail className="h-4 w-4 text-amber-500" />
                </div>
                <a
                  href="mailto:info@remstroy.ru"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  info@remstroy.ru
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-2 bg-zinc-900 rounded-lg">
                  <MapPin className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-sm">
                  г. Москва, ул. Примерная, д. 1
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} РемСтрой. Все права защищены.
            </p>
            <div className="flex space-x-6">
              {footerLinks.info.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-600">
              Создано для профессионалов строительства
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
