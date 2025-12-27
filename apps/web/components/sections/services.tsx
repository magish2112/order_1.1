'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { ServiceCategory } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Home, Paintbrush, Wrench } from 'lucide-react'

const serviceIcons = {
  remont: Wrench,
  dizajn: Paintbrush,
  uslugi: Home,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function Services() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => api.get<ServiceCategory[]>('/categories'),
  })

  const mainCategories = categories?.filter((cat) => !cat.parentId).slice(0, 3) || []

  if (isLoading) {
    return (
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-zinc-400">Загрузка...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="relative bg-zinc-950 py-16 lg:py-24 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(251, 191, 36) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(251, 191, 36) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-amber-600/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-orange-600/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm text-amber-500 font-medium">Наши услуги</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Профессиональные услуги
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Комплексные решения для ремонта и дизайна вашего пространства.
            От идеи до реализации с гарантией качества.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {mainCategories.map((category) => {
            const Icon = serviceIcons[category.slug as keyof typeof serviceIcons] || Home

            return (
              <motion.div key={category.id} variants={itemVariants}>
                <div className="group relative h-full overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-amber-600/10">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300" />

                  {category.image && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="relative p-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="p-2 bg-amber-600/10 rounded-lg border border-amber-600/20">
                        <Icon className="h-6 w-6 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    </div>
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                      {category.shortDescription || category.description}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700 text-zinc-300 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all group-hover:border-amber-500"
                      asChild
                    >
                      <Link href={`/${category.slug}`}>
                        Подробнее
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-500" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white group"
            asChild
          >
            <Link href="/remont">
              Все услуги
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  )
}
