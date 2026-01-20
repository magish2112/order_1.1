'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Instagram,
  Building2,
  HardHat,
  Ruler,
  Shield,
  CheckCircle2,
  Award,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function HomepageLayout() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const advantages = [
    {
      icon: <HardHat className="h-8 w-8 text-accent" />,
      title: 'Безопасность',
      description: 'Строгое соблюдение всех норм безопасности и охраны труда',
    },
    {
      icon: <Award className="h-8 w-8 text-accent" />,
      title: 'Качество',
      description: 'Используем только проверенные материалы и технологии',
    },
    {
      icon: <Ruler className="h-8 w-8 text-accent" />,
      title: 'Точность',
      description: 'Точное соблюдение сроков и технических требований',
    },
    {
      icon: <Shield className="h-8 w-8 text-accent" />,
      title: 'Гарантия',
      description: 'Предоставляем гарантию на все виды выполненных работ',
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      title: 'Опытная команда',
      description: 'Профессионалы с многолетним опытом работы',
    },
    {
      icon: <Clock className="h-8 w-8 text-accent" />,
      title: 'Соблюдение сроков',
      description: 'Сдаем объекты точно в срок без задержек',
    },
  ]

  const services = [
    {
      icon: <Building2 className="h-10 w-10 text-accent" />,
      title: 'Строительство',
      description: 'Полный цикл строительных работ от проектирования до сдачи объекта',
    },
    {
      icon: <HardHat className="h-10 w-10 text-accent" />,
      title: 'Ремонт',
      description: 'Качественный ремонт квартир, офисов и коммерческих помещений',
    },
    {
      icon: <Sparkles className="h-10 w-10 text-accent" />,
      title: 'Дизайн',
      description: 'Профессиональное дизайнерское оформление интерьеров',
    },
    {
      icon: <Ruler className="h-10 w-10 text-accent" />,
      title: 'Проектирование',
      description: 'Разработка проектной документации любой сложности',
    },
  ]

  const stats = [
    { value: '500+', label: 'Завершенных проектов' },
    { value: '15+', label: 'Лет на рынке' },
    { value: '98%', label: 'Довольных клиентов' },
    { value: '24/7', label: 'Поддержка клиентов' },
  ]

  const testimonials = [
    {
      quote:
        'Работа с ETERNO STROY превзошла все ожидания. Профессиональный подход, качественные материалы и соблюдение сроков. Рекомендую!',
      author: 'Александр Петров',
      company: 'Владелец бизнес-центра',
    },
    {
      quote:
        'Команда выполнила ремонт нашей квартиры на высшем уровне. Все работы выполнены качественно, в срок и с соблюдением всех договоренностей.',
      author: 'Мария Иванова',
      company: 'Частный клиент',
    },
    {
      quote:
        'Отличная компания для строительства. Сдали объект точно в срок, качество работ на высоте. Будем сотрудничать и дальше.',
      author: 'Дмитрий Соколов',
      company: 'Застройщик',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--accent)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--accent)) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-accent/10 to-transparent blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm text-accent font-medium">Лидер строительной индустрии</span>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                  Строим будущее
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/80">
                    с надежностью и качеством
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                  Профессиональное строительство промышленных и коммерческих объектов. Более 15 лет опыта в реализации
                  сложных проектов.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground group rounded-full"
                  asChild
                >
                  <Link href="#calculator">
                    Рассчитать стоимость
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full group" asChild>
                  <Link href="/portfolio">
                    Смотреть портфолио
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm"
                  >
                    <div className="text-2xl font-bold text-accent">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[600px]">
                {/* Construction Visual Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Building Outline */}
                    <div className="absolute bottom-0 left-1/4 w-48 h-80 border-4 border-border bg-card/30 backdrop-blur-sm rounded-t-lg">
                      {/* Windows Grid */}
                      <div className="grid grid-cols-3 gap-4 p-4 h-full">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="bg-accent/20 border border-accent/30 rounded animate-pulse"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Geometric Shapes */}
                    <div className="absolute top-20 left-10 w-32 h-32 border-2 border-accent/30 rotate-45 animate-pulse" />
                    <div className="absolute bottom-40 right-10 w-24 h-24 border-2 border-accent/30 rotate-12" />

                    {/* Floating Stats Cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute top-10 right-10 px-4 py-3 bg-card/80 border border-accent/30 backdrop-blur-sm rounded-lg shadow-lg"
                    >
                      <div className="text-2xl font-bold text-accent">500+</div>
                      <div className="text-xs text-muted-foreground">Проектов</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute bottom-20 left-10 px-4 py-3 bg-card/80 border border-accent/30 backdrop-blur-sm rounded-lg shadow-lg"
                    >
                      <div className="text-2xl font-bold text-accent">15+</div>
                      <div className="text-xs text-muted-foreground">Лет опыта</div>
                    </motion.div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-card/30">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container px-4 md:px-6"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent font-medium">Наши преимущества</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Почему выбирают нас
            </h2>
            <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Мы предлагаем комплексные решения для строительства и ремонта с гарантией качества
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                variants={itemFadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md bg-background/80 hover:border-accent/50"
              >
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all duration-300"></div>
                <div className="relative space-y-3">
                  <div className="mb-4">{advantage.icon}</div>
                  <h3 className="text-xl font-bold">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full py-12 md:py-24 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container px-4 md:px-6"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent font-medium">Наши услуги</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Что мы предлагаем
            </h2>
            <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Полный спектр услуг для строительства, ремонта и дизайна
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemFadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md bg-background/80 hover:border-accent/50"
              >
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all duration-300"></div>
                <div className="relative space-y-3">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href="#"
                    className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Подробнее
                  </Link>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-card/30">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container px-4 md:px-6"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent font-medium">Отзывы</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Что говорят наши клиенты
            </h2>
            <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Мнения тех, кто уже доверил нам свои проекты
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemFadeIn}
                whileHover={{ y: -10 }}
                className="flex flex-col justify-between rounded-xl border bg-background p-6 shadow-sm"
              >
                <div>
                  <div className="flex gap-0.5 text-accent">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-lg font-medium leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent font-medium">Контакты</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Свяжитесь с нами
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Готовы начать свой проект? Свяжитесь с нами, чтобы обсудить, как мы можем помочь воплотить вашу идею в
              жизнь.
            </p>
            <div className="mt-8 space-y-4">
              <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3">
                <div className="rounded-xl bg-accent/10 p-2">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium">Наш адрес</h3>
                  <p className="text-sm text-muted-foreground">г. Москва, ул. Строительная, д. 1</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3">
                <div className="rounded-xl bg-accent/10 p-2">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">info@eternostroy.ru</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3">
                <div className="rounded-xl bg-accent/10 p-2">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium">Телефон</h3>
                  <p className="text-sm text-muted-foreground">+7 (495) 123-45-67</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border bg-background p-6 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-2">Отправить сообщение</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Заполните форму ниже, и мы свяжемся с вами в ближайшее время.
            </p>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium leading-none">
                    Имя
                  </label>
                  <Input id="first-name" placeholder="Введите ваше имя" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium leading-none">
                    Фамилия
                  </label>
                  <Input id="last-name" placeholder="Введите вашу фамилию" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <Input id="email" type="email" placeholder="Введите ваш email" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium leading-none">
                  Сообщение
                </label>
                <Textarea
                  id="message"
                  placeholder="Введите ваше сообщение"
                  className="min-h-[120px] rounded-xl"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full rounded-full bg-accent hover:bg-accent/90">
                  Отправить сообщение
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

