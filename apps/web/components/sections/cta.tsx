'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function Cta() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="relative bg-background py-16 lg:py-20 overflow-hidden"
    >
      {/* Industrial Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--accent)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--accent)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-accent font-medium">Начнем проект</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Готовы начать свой проект?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Свяжитесь с нами сегодня и получите бесплатную консультацию.
            Мы превратим ваши идеи в реальность.
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
              className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all hover:scale-105 shadow-lg hover:shadow-accent/25"
              asChild
            >
              <Link href="/kontakty">
                <Phone className="mr-2 h-5 w-5" />
                Позвонить нам
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground group transition-all hover:scale-105"
              asChild
            >
              <Link href="/kalkulyator">
                <MessageCircle className="mr-2 h-5 w-5" />
                Заказать расчет
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
