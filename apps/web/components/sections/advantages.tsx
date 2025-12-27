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
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-gradient-to-br from-amber-600/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-gradient-to-tl from-orange-600/10 to-transparent blur-3xl" />

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
            <span className="text-sm text-amber-500 font-medium">Наше преимущество</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Почему выбирают нас
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Мы обеспечиваем высокое качество и индивидуальный подход к каждому проекту.
            Надежность, профессионализм и соблюдение сроков - наши главные принципы.
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
              className="group relative rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-amber-600/10"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300" />

              <div className="relative">
                <div className="mb-4 inline-flex rounded-lg bg-amber-600/10 p-3 border border-amber-600/20 group-hover:bg-amber-600/20 transition-colors">
                  <advantage.icon className="h-6 w-6 text-amber-500 group-hover:text-amber-400" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white group-hover:text-amber-100 transition-colors">
                  {advantage.title}
                </h3>
                <p className="text-zinc-400 group-hover:text-zinc-300 leading-relaxed">{advantage.description}</p>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
