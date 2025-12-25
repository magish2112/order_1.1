'use client'

import { motion } from 'framer-motion'
import { Award, Clock, Shield, Users, TrendingUp, CheckCircle2 } from 'lucide-react'

const advantages = [
  {
    icon: Award,
    title: '500+ проектов',
    description: 'Более 500 успешно выполненных проектов различной сложности',
  },
  {
    icon: Clock,
    title: 'Соблюдение сроков',
    description: 'Гарантируем выполнение работ в установленные сроки',
  },
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: 'Даем гарантию на все виды выполненных работ до 5 лет',
  },
  {
    icon: Users,
    title: 'Опытная команда',
    description: 'Профессиональные мастера с опытом работы от 5 лет',
  },
  {
    icon: TrendingUp,
    title: 'Прозрачные цены',
    description: 'Фиксированные цены без скрытых доплат и переплат',
  },
  {
    icon: CheckCircle2,
    title: 'Экологичные материалы',
    description: 'Используем только сертифицированные материалы премиум-класса',
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function Advantages() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 py-16 lg:py-24"
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
            Почему выбирают нас
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Мы обеспечиваем высокое качество и индивидуальный подход к каждому
            проекту
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary-100 p-3">
                <advantage.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {advantage.title}
              </h3>
              <p className="text-gray-600">{advantage.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
