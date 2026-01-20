'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, X, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigation: Array<{
    name: string
    href: string
    children?: Array<{
      name: string
      href: string
      children?: Array<{ name: string; href: string }>
    }>
  }>
  isActive: (href: string) => boolean
}

export function MobileMenu({ isOpen, onClose, navigation, isActive }: MobileMenuProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (name: string) => {
    const newSet = new Set(openItems)
    if (newSet.has(name)) {
      newSet.delete(name)
    } else {
      newSet.add(name)
    }
    setOpenItems(newSet)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-80 bg-background/95 backdrop-blur-md border-l border-border shadow-2xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-accent to-accent/80 rounded-md flex items-center justify-center">
                  <Phone className="h-3 w-3 text-accent-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">Меню</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:text-accent hover:bg-muted transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto pb-4">
              {/* Contact Info */}
              <div className="border-b border-border p-4">
                <a
                  href="tel:+79991234567"
                  className="flex items-center space-x-3 rounded-lg bg-card/50 border border-border p-3 text-muted-foreground hover:bg-muted hover:border-accent/30 transition-all duration-200"
                >
                  <Phone className="h-5 w-5 text-accent" />
                  <div>
                    <div className="font-medium text-foreground">+7 (999) 123-45-67</div>
                    <div className="text-xs text-muted-foreground">Нажмите для звонка</div>
                  </div>
                </a>
              </div>
              
              <nav className="space-y-1 p-4">
                {navigation.slice(0, 7).map((item) => (
                  <div key={item.name}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <button
                          onClick={() => toggleItem(item.name)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-all duration-200',
                            isActive(item.href)
                              ? 'bg-accent/10 border border-accent/20 text-accent'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            {/* Add icon for each nav item */}
                            {item.name === 'Ремонт' && <Phone className="h-4 w-4 text-accent" />}
                            {item.name === 'Дизайн' && <ChevronDown className="h-4 w-4 text-accent" />}
                            {item.name === 'Прочие услуги' && <Phone className="h-4 w-4 text-accent" />}
                            {item.name === 'Портфолио' && <Phone className="h-4 w-4 text-accent" />}
                            {item.name === 'Статьи' && <Phone className="h-4 w-4 text-accent" />}
                            <span>{item.name}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 transition-transform duration-200 text-muted-foreground',
                              openItems.has(item.name) && 'rotate-180 text-accent'
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {openItems.has(item.name) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 space-y-1 border-l-2 border-border pl-4">
                                {item.children.slice(0, 4).map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={onClose}
                                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-accent"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                                {item.children.length > 4 && (
                                  <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="block rounded-lg px-3 py-2 text-sm text-accent hover:text-accent/80 transition-colors"
                                  >
                                    Смотреть все...
                                  </Link>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center space-x-2 block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200',
                          isActive(item.href)
                            ? 'bg-accent/10 border border-accent/20 text-accent'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {/* Add icon for each nav item */}
                        {item.name === 'О компании' && <Phone className="h-4 w-4 text-accent" />}
                        {item.name === 'Вакансии' && <Phone className="h-4 w-4 text-accent" />}
                        {item.name === 'Контакты' && <Phone className="h-4 w-4 text-accent" />}
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

