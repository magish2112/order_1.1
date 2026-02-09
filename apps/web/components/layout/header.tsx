'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Menu, Phone, ChevronDown, Calculator, HardHat, Building2, Wrench, Ruler, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, getImageUrl } from '@/lib/utils'
import { MobileMenu } from './mobile-menu'
import { CallbackModal } from '@/components/modals/callback-modal'
import { api } from '@/lib/api'
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
    name: 'Услуги',
    href: '/uslugi',
    children: [
      { name: 'Ремонт', href: '/uslugi/remont' },
      { name: 'Дизайн', href: '/uslugi/dizajn' },
      { name: 'Комплектация', href: '/uslugi/komplektaciya' },
      { name: 'Мебель', href: '/uslugi/mebel' },
    ]
  },
  {
    name: 'Портфолио',
    href: '/portfolio',
    children: [
      { name: 'Все проекты', href: '/portfolio' },
      { name: 'Квартиры', href: '/portfolio?type=kvartiry' },
      { name: 'Дома', href: '/portfolio?type=doma' },
      { name: 'Коммерческие', href: '/portfolio?type=commercial' },
    ]
  },
  {
    name: 'О компании',
    href: '/o-kompanii',
    children: [
      { name: 'О нас', href: '/o-kompanii' },
      { name: 'Наши преимущества', href: '/o-kompanii#preimushchestva' },
      { name: 'Вакансии', href: '/vakansii' },
      { name: 'Отзывы', href: '/o-kompanii#otzyvy' },
    ]
  },
  { name: 'Статьи', href: '/stati' },
  { name: 'Контакты', href: '/kontakty' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Получаем настройки для логотипа
  const { data: settingsResponse } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => api.get<{ success: boolean; data: Record<string, unknown> }>('/settings/public'),
    staleTime: 5 * 60 * 1000, // Кеш на 5 минут
  })

  const settings = settingsResponse?.data || {}
  const logoUrl = getImageUrl((settings.logo as string) || '/logo.svg') || '/logo.svg'

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
      case 'Услуги':
        return Wrench
      case 'Портфолио':
        return HardHat
      case 'О компании':
        return Building2
      case 'Статьи':
        return Hammer
      case 'Контакты':
        return Phone
      default:
        return null
    }
  }

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-background/90 backdrop-blur-sm border-b border-border/50"
      )}>
        {/* Subtle gradient line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <Image
                        src={logoUrl}
                        alt="ETERNO STROY"
                        width={48}
                        height={48}
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        priority
                        unoptimized={logoUrl.startsWith('http')}
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-accent to-accent/80 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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
                          'text-foreground/80 hover:text-foreground hover:bg-muted',
                          'data-[state=open]:text-accent data-[state=open]:bg-muted',
                          isActive(item.href) && 'text-accent bg-muted'
                        )}>
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-[600px] p-4 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl">
                            <div className="grid grid-cols-2 gap-4">
                              {subcategories.slice(0, 8).map((subcategory) => (
                                <NavigationMenuPrimitive.Link key={subcategory.href} asChild>
                                  <Link
                                    href={subcategory.href}
                                    className={cn(
                                      'group block select-none space-y-2 rounded-lg p-3 leading-none no-underline outline-none transition-all',
                                      'hover:bg-muted hover:border-accent/20 border border-transparent',
                                      isActive(subcategory.href) && 'bg-muted border-accent/20'
                                    )}
                                  >
                                    <div className="text-sm font-medium text-foreground group-hover:text-accent">
                                      {subcategory.title}
                                    </div>
                                    {subcategory.description && (
                                      <p className="text-xs text-muted-foreground group-hover:text-foreground/80">
                                        {subcategory.description}
                                      </p>
                                    )}
                                  </Link>
                                </NavigationMenuPrimitive.Link>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-border">
                              <Link
                                href={item.href}
                                className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                              >
                                <span>Смотреть все {item.name.toLowerCase()}</span>
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
                            'text-foreground/80 hover:text-foreground hover:bg-muted',
                            isActive(item.href) && 'text-accent bg-muted'
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
                href={`tel:${(settings.phone as string)?.replace(/[^0-9+]/g, '') || '+79991234567'}`}
                className="flex items-center space-x-2 text-sm font-medium text-foreground/80 hover:text-accent transition-colors whitespace-nowrap"
              >
                <Phone className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="hidden xl:inline">{(settings.phone as string) || '+7 (999) 123-45-67'}</span>
                <span className="xl:hidden">Звонок</span>
              </a>

              <Button
                onClick={() => setCallbackModalOpen(true)}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent shadow-lg hover:shadow-accent/25 transition-all duration-200"
              >
                Заказать звонок
              </Button>

              <Button
                variant="outline"
                asChild
                size="sm"
                className={cn(
                  "group border-border text-foreground/80 hover:border-accent hover:text-accent transition-all duration-200",
                  "bg-card/50 hover:bg-muted backdrop-blur-sm",
                  "shadow-sm hover:shadow-accent/10"
                )}
              >
                <Link href="/kalkulyator">
                  <Calculator className="mr-2 h-4 w-4 group-hover:text-accent" />
                  <span className="hidden xl:inline">Калькулятор</span>
                  <span className="xl:hidden">Расчет</span>
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-foreground/80 hover:text-accent hover:bg-muted transition-all duration-200"
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
