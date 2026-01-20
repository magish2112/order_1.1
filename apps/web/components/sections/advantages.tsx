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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-accent font-medium">Наше преимущество</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Почему выбирают нас
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
              className="group relative rounded-xl bg-card/50 border border-border p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card/80 hover:shadow-2xl hover:shadow-accent/10"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/5 transition-all duration-300" />

              <div className="relative">
                <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                  <advantage.icon className="h-6 w-6 text-accent group-hover:text-accent/80" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                  {advantage.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 leading-relaxed">{advantage.description}</p>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent/80 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
