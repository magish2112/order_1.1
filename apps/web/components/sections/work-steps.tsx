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
            backgroundSize: '60px 60px',
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
            <span className="text-sm text-amber-500 font-medium">Как мы работаем</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Прозрачный процесс работы
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            От заявки до сдачи готового объекта. Каждый этап контролируется,
            сроки соблюдаются, качество гарантируется.
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
              <motion.div key={step.number} variants={itemVariants} className="relative group">
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-16 hidden h-0.5 w-full bg-gradient-to-r from-amber-600/50 to-transparent lg:block" />
                )}

                <div className="group relative overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-amber-600/10">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300" />

                  <div className="relative">
                    <div className="mb-4 flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span className="text-3xl font-bold text-amber-500/50 group-hover:text-amber-400 transition-colors">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white group-hover:text-amber-100 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-zinc-400 group-hover:text-zinc-300 leading-relaxed">{step.description}</p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
