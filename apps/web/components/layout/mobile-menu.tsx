'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            className="fixed right-0 top-0 z-50 h-full w-80 bg-white shadow-2xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <span className="text-lg font-semibold">Меню</span>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto pb-4">
              <nav className="space-y-1 p-4">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <button
                          onClick={() => toggleItem(item.name)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors',
                            isActive(item.href)
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 transition-transform',
                              openItems.has(item.name) && 'rotate-180'
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
                              <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-4">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={onClose}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-600"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
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
                          'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {item.name}
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

