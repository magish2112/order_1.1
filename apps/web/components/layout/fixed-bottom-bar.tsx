'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CallbackModal } from '@/components/modals/callback-modal'
import Link from 'next/link'

export function FixedBottomBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const pathname = usePathname()

  // Скрывать на мобильных страницах
  const isMobilePage = pathname === '/kontakty' || pathname === '/kalkulyator'

  useEffect(() => {
    if (isMobilePage) {
      setIsVisible(false)
      return
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 200) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          setIsVisible(true)
        } else {
          // Scrolling up
          setIsVisible(false)
        }
      } else {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMobilePage])

  if (isMobilePage) {
    return null
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-around gap-2 p-4">
              <Button
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href="/kalkulyator">
                  <Calculator className="mr-2 h-5 w-5" />
                  Калькулятор
                </Link>
              </Button>
              <Button
                className="flex-1"
                onClick={() => setCallbackModalOpen(true)}
              >
                <Phone className="mr-2 h-5 w-5" />
                Заказать звонок
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
      />
    </>
  )
}

