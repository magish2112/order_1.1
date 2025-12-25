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
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Загрузка...</p>
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
      className="bg-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Наши услуги
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Комплексные решения для ремонта и дизайна вашего пространства
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
                <Card className="group h-full overflow-hidden transition-all hover:shadow-xl">
                  {category.image && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-2 flex items-center space-x-2">
                      <Icon className="h-6 w-6 text-primary-600" />
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {category.shortDescription || category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary-600 group-hover:text-white transition-colors"
                      asChild
                    >
                      <Link href={`/${category.slug}`}>
                        Подробнее
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
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
          <Button size="lg" variant="outline" asChild>
            <Link href="/remont">Все услуги</Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  )
}
