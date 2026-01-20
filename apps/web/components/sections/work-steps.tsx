'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { api, ApiResponse } from '@/lib/api'
import { ServiceCategory } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Hammer, Paintbrush, Home, ArrowRight } from 'lucide-react'

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  remont: Hammer,
  dizajn: Paintbrush,
  uslugi: Home,
  building: Building2,
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
    transition: { duration: 0.5 },
  },
}

export function WorkSteps() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ServiceCategory[]>>('/categories')
      return response.data
    },
  })

  const mainCategories = categories?.filter((cat) => !cat.parentId).slice(0, 4) || []

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка...</p>
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
      className="relative py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 text-white border-0" style={{ backgroundColor: 'hsl(var(--accent))' }}>
            Наши услуги
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Полный спектр строительных услуг
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            От проектирования до финальной отделки — мы реализуем проекты любой сложности
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {mainCategories.map((category) => {
            const Icon = serviceIcons[category.slug as string] || Building2

            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Card className="border-2 hover:shadow-xl transition-all duration-300 group cursor-pointer border-accent/50 bg-card">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-primary">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      {category.shortDescription || category.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all">
                      Подробнее
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
