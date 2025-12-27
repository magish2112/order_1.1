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
            className="fixed right-0 top-0 z-50 h-full w-80 bg-zinc-950/95 backdrop-blur-md border-l border-zinc-800/50 shadow-2xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-zinc-800/50 px-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md flex items-center justify-center">
                  <Phone className="h-3 w-3 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Меню</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto pb-4">
              {/* Contact Info */}
              <div className="border-b border-zinc-800/50 p-4">
                <a
                  href="tel:+79991234567"
                  className="flex items-center space-x-3 rounded-lg bg-zinc-900/50 border border-zinc-700 p-3 text-zinc-300 hover:bg-zinc-800/50 hover:border-amber-600/30 transition-all duration-200"
                >
                  <Phone className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-medium text-white">+7 (999) 123-45-67</div>
                    <div className="text-xs text-zinc-400">Нажмите для звонка</div>
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
                              ? 'bg-amber-600/10 border border-amber-600/20 text-amber-400'
                              : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            {/* Add icon for each nav item */}
                            {item.name === 'Ремонт' && <Phone className="h-4 w-4 text-amber-500" />}
                            {item.name === 'Дизайн' && <ChevronDown className="h-4 w-4 text-amber-500" />}
                            {item.name === 'Прочие услуги' && <Phone className="h-4 w-4 text-amber-500" />}
                            {item.name === 'Портфолио' && <Phone className="h-4 w-4 text-amber-500" />}
                            {item.name === 'Статьи' && <Phone className="h-4 w-4 text-amber-500" />}
                            <span>{item.name}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 transition-transform duration-200 text-zinc-400',
                              openItems.has(item.name) && 'rotate-180 text-amber-400'
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
                              <div className="ml-4 space-y-1 border-l-2 border-zinc-700 pl-4">
                                {item.children.slice(0, 4).map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={onClose}
                                    className="block rounded-lg px-3 py-2 text-sm text-zinc-400 transition-all duration-200 hover:bg-zinc-800/50 hover:text-amber-400"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                                {item.children.length > 4 && (
                                  <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="block rounded-lg px-3 py-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
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
                            ? 'bg-amber-600/10 border border-amber-600/20 text-amber-400'
                            : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
                        )}
                      >
                        {/* Add icon for each nav item */}
                        {item.name === 'О компании' && <Phone className="h-4 w-4 text-amber-500" />}
                        {item.name === 'Вакансии' && <Phone className="h-4 w-4 text-amber-500" />}
                        {item.name === 'Контакты' && <Phone className="h-4 w-4 text-amber-500" />}
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

