'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Hammer, Paintbrush, Home, ArrowRight } from 'lucide-react'

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  remont: Hammer,
  remontKvartir: Home,
  dizajn: Paintbrush,
  uslugi: Building2,
}

const services = [
  {
    id: 'remont',
    title: 'Ремонт',
    description: 'Профессиональный ремонт под ключ',
    href: '/uslugi',
    icon: 'remont',
  },
  {
    id: 'remont-kvartir',
    title: 'Ремонт квартир',
    description: 'Ремонт квартир под ключ',
    href: '/uslugi/remont',
    icon: 'remontKvartir',
  },
  {
    id: 'dizajn',
    title: 'Дизайн',
    description: 'Современные дизайнерские решения',
    href: '/uslugi/dizajn',
    icon: 'dizajn',
  },
  {
    id: 'uslugi',
    title: 'Услуги',
    description: 'Широкий спектр строительных услуг',
    href: '/uslugi',
    icon: 'uslugi',
  },
]

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
          {services.map((service) => {
            const Icon =
              serviceIcons[service.icon as keyof typeof serviceIcons] || Building2

            return (
              <motion.div key={service.id} variants={itemVariants}>
                <Card className="border-2 hover:shadow-xl transition-all duration-300 group cursor-pointer border-accent/50 bg-card">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-primary">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <a
                      href={service.href}
                      className="flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all"
                    >
                      Подробнее
                      <ArrowRight className="w-4 h-4" />
                    </a>
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
