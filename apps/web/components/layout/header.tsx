'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MegaMenu } from './mega-menu'
import { MobileMenu } from './mobile-menu'
import { CallbackModal } from '@/components/modals/callback-modal'

const navigation = [
  {
    name: 'Ремонт',
    href: '/remont',
    image: '/images/remont.jpg',
    children: [
      {
        name: 'Ремонт квартир',
        href: '/remont/kvartiry',
        children: [
          { name: 'Студии', href: '/remont/kvartiry/studiya' },
          { name: '1-к квартиры', href: '/remont/kvartiry/1k' },
          { name: '2-к квартиры', href: '/remont/kvartiry/2k' },
          { name: '3-к квартиры', href: '/remont/kvartiry/3k' },
          { name: '4-к квартиры', href: '/remont/kvartiry/4k' },
          { name: '5-к квартиры', href: '/remont/kvartiry/5k' },
        ],
      },
      {
        name: 'Новостройки',
        href: '/remont/novostroyki',
        children: [
          { name: '1-к квартиры', href: '/remont/novostroyki/1k' },
          { name: '2-к квартиры', href: '/remont/novostroyki/2k' },
          { name: '3-к квартиры', href: '/remont/novostroyki/3k' },
        ],
      },
      {
        name: 'Вторичные',
        href: '/remont/vtorichnye',
        children: [
          { name: 'Ремонт хрущёвки', href: '/remont/vtorichnye/hruschevka' },
          { name: 'Ремонт в сталинке', href: '/remont/vtorichnye/stalinka' },
        ],
      },
      {
        name: 'Виды ремонта',
        href: '/remont/vidy',
        children: [
          { name: 'Элитный', href: '/remont/vidy/elitnyj' },
          { name: 'Дизайнерский', href: '/remont/vidy/dizajnerskij' },
          { name: 'Капитальный', href: '/remont/vidy/kapitalnyj' },
          { name: 'Евроремонт', href: '/remont/vidy/evroremont' },
          { name: 'Комплексный', href: '/remont/vidy/kompleksnyj' },
        ],
      },
      {
        name: 'Стили ремонта',
        href: '/remont/stili',
        children: [
          { name: 'Современный', href: '/remont/stili/sovremennyj' },
          { name: 'Минимализм', href: '/remont/stili/minimalizm' },
          { name: 'Лофт', href: '/remont/stili/loft' },
          { name: 'Классика', href: '/remont/stili/klassika' },
          { name: 'Скандинавский', href: '/remont/stili/skandinavskij' },
        ],
      },
    ],
  },
  {
    name: 'Дизайн',
    href: '/dizajn',
    image: '/images/dizajn.jpg',
    children: [
      {
        name: 'Дизайн-проект интерьера',
        href: '/dizajn/proekt',
        children: [
          { name: 'Студий', href: '/dizajn/proekt/studiya' },
          { name: '1-к квартир', href: '/dizajn/proekt/1k' },
          { name: '2-к квартир', href: '/dizajn/proekt/2k' },
        ],
      },
      {
        name: 'Стили дизайна',
        href: '/dizajn/stili',
        children: [
          { name: 'Современный', href: '/dizajn/stili/sovremennyj' },
          { name: 'Минимализм', href: '/dizajn/stili/minimalizm' },
          { name: 'Лофт', href: '/dizajn/stili/loft' },
        ],
      },
    ],
  },
  {
    name: 'Прочие услуги',
    href: '/uslugi',
    image: '/images/uslugi.jpg',
    children: [
      { name: 'Дома', href: '/uslugi/doma' },
      { name: 'Коттеджи', href: '/uslugi/kottedzhi' },
      { name: 'Апартаменты', href: '/uslugi/apartamenty' },
      { name: 'Офисы', href: '/uslugi/ofisy' },
      { name: 'Рестораны', href: '/uslugi/restorany' },
    ],
  },
  { name: 'Портфолио', href: '/portfolio' },
  { name: 'Статьи', href: '/stati' },
  { name: 'О компании', href: '/o-kompanii' },
  { name: 'Вакансии', href: '/vakansii' },
  { name: 'Контакты', href: '/kontakty' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary-600">
                  РемСтрой
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center lg:space-x-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                  onMouseLeave={() => {
                    setTimeout(() => {
                      setOpenDropdown(null)
                    }, 200)
                  }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1 px-4 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    )}
                  >
                    <span>{item.name}</span>
                    {item.children && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          openDropdown === item.name && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>

                  {/* Mega Menu */}
                  {item.children && (
                    <MegaMenu
                      category={item as any}
                      isOpen={openDropdown === item.name}
                      onClose={() => setOpenDropdown(null)}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              <a
                href="tel:+79991234567"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+7 (999) 123-45-67</span>
              </a>
              <Button onClick={() => setCallbackModalOpen(true)}>
                Заказать звонок
              </Button>
              <Button variant="outline" asChild>
                <Link href="/kalkulyator">Калькулятор</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation as any}
        isActive={isActive}
      />

      {/* Callback Modal */}
      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
      />
    </>
  )
}
