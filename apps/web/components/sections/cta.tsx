'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export function Cta() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-primary-600 to-primary-700 py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Готовы начать свой проект?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-primary-100"
          >
            Свяжитесь с нами сегодня и получите бесплатную консультацию
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          >
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100 transition-all hover:scale-105"
              asChild
            >
              <Link href="/kontakty">
                <Phone className="mr-2 h-5 w-5" />
                Позвонить нам
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 transition-all hover:scale-105"
              asChild
            >
              <Link href="/kalkulyator">
                <MessageCircle className="mr-2 h-5 w-5" />
                Заказать расчет
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
