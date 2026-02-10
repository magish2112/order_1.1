'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { api, ApiResponse } from '@/lib/api'
import { Faq } from '@/lib/types'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQSchema } from '@/components/seo/structured-data'
import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { CallbackModal } from '@/components/modals/callback-modal'

export function FaqSection() {
  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Faq[]>>('/faqs?limit=100')
      return response.data
    },
  })

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)

  const fallbackFaqs: Faq[] = [
    {
      id: 'static-1',
      question: 'Даем ли мы гарантию на работы?',
      answer: 'Да, мы предоставляем гарантию до 3 лет на выполненные работы.',
      isActive: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'static-2',
      question: 'Занимаемся ли мы поставкой материалов?',
      answer: 'Да, мы полностью берем на себя поставку и логистику материалов.',
      isActive: true,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const effectiveFaqs: Faq[] =
    !faqs || faqs.length === 0 || error
      ? fallbackFaqs
      : [
          ...faqs,
          ...fallbackFaqs.filter(
            (fallback) => !faqs.some((item) => item.question === fallback.question),
          ),
        ]

  if (isLoading && !faqs) {
    return (
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <motion.section
        id="faq"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="relative bg-background py-16 lg:py-24 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(to right, hsl(var(--accent)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--accent)) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-gradient-to-br from-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-gradient-to-tl from-accent/10 to-transparent blur-3xl" />
        <FAQSchema
          faqs={effectiveFaqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          }))}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm mb-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Часто задаваемые вопросы
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ответы на самые популярные вопросы о наших услугах и процессе работы.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {effectiveFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group overflow-hidden rounded-xl bg-card/50 border border-border backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card/80 hover:shadow-2xl hover:shadow-accent/10"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/5 transition-all duration-300" />

                <button
                  type="button"
                  className="relative flex w-full items-center justify-between p-6 text-left z-10"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-foreground group-hover:text-accent-foreground transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-accent',
                      openIndex === index && 'rotate-180 text-accent'
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-zinc-700 px-6 py-4">
                        <p className="text-foreground/80 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent/80 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-foreground"
              onClick={() => setCallbackModalOpen(true)}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Задать вопрос
            </Button>
          </div>
        </div>
      </motion.section>

      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
      />
    </>
  )
}
