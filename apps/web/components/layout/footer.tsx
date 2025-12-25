import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Send } from 'lucide-react'

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
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-white">
                РемСтрой
              </span>
            </Link>
            <p className="mb-4 text-sm">
              Ремонт и дизайн в Москве
            </p>
            <p className="mb-4 text-sm">
              Профессиональный ремонт и дизайн интерьеров. Более 500+ успешно
              выполненных проектов.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Услуги</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Компания</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-sm">+7 (999) 123-45-67</p>
                  <p className="text-xs text-gray-400">Ежедневно 9:00 - 21:00</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <a
                  href="mailto:info@remstroy.ru"
                  className="text-sm hover:text-white transition-colors"
                >
                  info@remstroy.ru
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  г. Москва, ул. Примерная, д. 1
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} РемСтрой. Все права защищены.
            </p>
            <div className="flex space-x-6">
              {footerLinks.info.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            Дизайн и разработка
          </p>
        </div>
      </div>
    </footer>
  )
}
