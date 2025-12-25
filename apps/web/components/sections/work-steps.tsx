'use client'

import { motion } from 'framer-motion'
import { Search, FileText, Hammer, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Консультация',
    description: 'Бесплатная консультация с дизайнером, выезд на объект и оценка стоимости работ',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Составление сметы',
    description: 'Детальная смета работ, выбор материалов и согласование проекта',
  },
  {
    number: '03',
    icon: Hammer,
    title: 'Выполнение работ',
    description: 'Качественное выполнение всех видов работ с соблюдением технологии и сроков',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Сдача объекта',
    description: 'Финальный осмотр, устранение недочетов и сдача готового объекта заказчику',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function WorkSteps() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24"
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
            Как мы работаем
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Простой и прозрачный процесс от заявки до сдачи объекта
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={itemVariants} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-24 hidden h-0.5 w-full bg-primary-200 lg:block" />
                )}
                <div className="relative">
                  <div className="mb-4 flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-primary-200">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
