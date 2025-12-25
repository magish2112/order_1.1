'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { Faq } from '@/lib/types'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQSchema } from '@/components/seo/structured-data'
import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { CallbackModal } from '@/components/modals/callback-modal'

export function FaqSection() {
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get<Faq[]>('/faqs'),
  })

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)

  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!faqs || faqs.length === 0) {
    return null
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="bg-white py-16 lg:py-24"
      >
        <FAQSchema
          faqs={faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          }))}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Часто задаваемые вопросы
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Ответы на самые популярные вопросы о наших услугах
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-gray-500 transition-transform duration-300',
                      openIndex === index && 'rotate-180'
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
                      <div className="border-t border-gray-200 px-6 py-4">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" onClick={() => setCallbackModalOpen(true)}>
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
