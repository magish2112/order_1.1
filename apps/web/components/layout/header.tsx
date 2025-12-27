'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, ChevronDown, Calculator, HardHat, Building2, Wrench, Ruler, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MobileMenu } from './mobile-menu'
import { CallbackModal } from '@/components/modals/callback-modal'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'

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
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const getNavIcon = (name: string) => {
    switch (name) {
      case 'Ремонт':
        return Wrench
      case 'Дизайн':
        return Ruler
      case 'Прочие услуги':
        return Building2
      case 'Портфолио':
        return HardHat
      case 'Статьи':
        return Hammer
      default:
        return null
    }
  }

  const getAllItemsText = (name: string) => {
    switch (name) {
      case 'Ремонт':
        return 'Смотреть все ремонты'
      case 'Дизайн':
        return 'Смотреть все дизайн-проекты'
      case 'Прочие услуги':
        return 'Смотреть все услуги'
      case 'Портфолио':
        return 'Смотреть все проекты'
      case 'Статьи':
        return 'Смотреть все статьи'
      default:
        return `Смотреть все ${name.toLowerCase()}`
    }
  }

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50 shadow-lg"
          : "bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/30"
      )}>
        {/* Subtle gradient line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <HardHat className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                      РемСтрой
                    </span>
                  </div>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList className="space-x-2">
                {navigation.slice(0, 5).map((item) => {
                  const IconComponent = getNavIcon(item.name)

                  if (item.children && item.children.length > 0) {
                    // Преобразуем вложенную структуру для dropdown меню
                    const subcategories = item.children.flatMap((child: any) => {
                      if (child.children && child.children.length > 0) {
                        return child.children.map((subchild: any) => ({
                          title: subchild.name,
                          href: subchild.href,
                          description: child.name,
                        }))
                      }
                      return {
                        title: child.name,
                        href: child.href,
                      }
                    })

                    return (
                      <NavigationMenuItem key={item.name}>
                        <NavigationMenuTrigger className={cn(
                          'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          'text-zinc-300 hover:text-white hover:bg-zinc-800/50',
                          'data-[state=open]:text-amber-400 data-[state=open]:bg-zinc-800/50',
                          isActive(item.href) && 'text-amber-400 bg-zinc-800/50'
                        )}>
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-[600px] p-4 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-xl shadow-2xl">
                            <div className="grid grid-cols-2 gap-4">
                              {subcategories.slice(0, 8).map((subcategory) => (
                                <NavigationMenuPrimitive.Link key={subcategory.href} asChild>
                                  <Link
                                    href={subcategory.href}
                                    className={cn(
                                      'group block select-none space-y-2 rounded-lg p-3 leading-none no-underline outline-none transition-all',
                                      'hover:bg-zinc-800/50 hover:border-amber-600/20 border border-transparent',
                                      isActive(subcategory.href) && 'bg-zinc-800/50 border-amber-600/20'
                                    )}
                                  >
                                    <div className="text-sm font-medium text-white group-hover:text-amber-400">
                                      {subcategory.title}
                                    </div>
                                    {subcategory.description && (
                                      <p className="text-xs text-zinc-400 group-hover:text-zinc-300">
                                        {subcategory.description}
                                      </p>
                                    )}
                                  </Link>
                                </NavigationMenuPrimitive.Link>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-700/50">
                              <Link
                                href={item.href}
                                className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                              >
                                <span>{getAllItemsText(item.name)}</span>
                                <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                              </Link>
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )
                  }

                  return (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuPrimitive.Link asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                            'text-zinc-300 hover:text-white hover:bg-zinc-800/50',
                            isActive(item.href) && 'text-amber-400 bg-zinc-800/50'
                          )}
                        >
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          {item.name}
                        </Link>
                      </NavigationMenuPrimitive.Link>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* CTA Buttons */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              <a
                href="tel:+79991234567"
                className="flex items-center space-x-2 text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors whitespace-nowrap"
              >
                <Phone className="h-4 w-4 flex-shrink-0 text-amber-500" />
                <span className="hidden xl:inline">+7 (999) 123-45-67</span>
                <span className="xl:hidden">Звонок</span>
              </a>

              <Button
                onClick={() => setCallbackModalOpen(true)}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-lg hover:shadow-amber-600/25 transition-all duration-200"
              >
                Заказать звонок
              </Button>

              <Button
                variant="outline"
                asChild
                size="sm"
                className={cn(
                  "group border-zinc-700 text-zinc-300 hover:border-amber-600 hover:text-amber-400 transition-all duration-200",
                  "bg-zinc-900/50 hover:bg-zinc-800/50 backdrop-blur-sm",
                  "shadow-sm hover:shadow-amber-600/10"
                )}
              >
                <Link href="/kalkulyator">
                  <Calculator className="mr-2 h-4 w-4 group-hover:text-amber-400" />
                  <span className="hidden xl:inline">Калькулятор</span>
                  <span className="xl:hidden">Расчет</span>
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-zinc-300 hover:text-amber-400 hover:bg-zinc-800/50 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
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
