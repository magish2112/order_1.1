'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import Image from 'next/image'
import InputMask from 'react-input-mask'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Phone, ArrowRight, Award, Users, Calendar } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'

const callbackSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  contactMethod: z.enum(['phone', 'telegram', 'whatsapp']),
})

type CallbackFormData = z.infer<typeof callbackSchema>

// Заглушка для фоновых изображений - в реальном проекте загружаются из API
const backgroundSlides = [
  '/images/hero-1.jpg',
  '/images/hero-2.jpg',
  '/images/hero-3.jpg',
  '/images/hero-4.jpg',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export function Hero() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CallbackFormData>({
    resolver: zodResolver(callbackSchema),
    defaultValues: {
      contactMethod: 'phone',
    },
  })

  const contactMethod = watch('contactMethod')

  const onSubmit = async (data: CallbackFormData) => {
    setIsSubmitting(true)
    try {
      await api.post('/requests/callback', {
        ...data,
        source: 'hero',
        pageUrl: window.location.href,
      })
      setIsSuccess(true)
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background Swiper */}
      <div className="absolute inset-0">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop
          className="h-full w-full"
        >
          {backgroundSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/80 to-primary-900/90 z-10" />
                {/* Ken Burns эффект - медленный zoom */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.1 }}
                  transition={{
                    duration: 10,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16"
        >
          {/* Left Column - Content */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center text-white">
            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Профессиональный ремонт и дизайн интерьеров
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mb-8 text-xl text-primary-100"
            >
              Превращаем ваши мечты в реальность. Более 500+ успешно выполненных
              проектов. Гарантия качества и соблюдение сроков.
            </motion.p>
            
            {/* Счётчики достижений */}
            <motion.div
              variants={itemVariants}
              className="mb-8 grid grid-cols-3 gap-6 rounded-lg bg-white/10 p-6 backdrop-blur-sm"
            >
              <div className="text-center">
                <Award className="mx-auto mb-2 h-8 w-8 text-white" />
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={500} suffix="+" />
                </div>
                <div className="mt-1 text-sm text-primary-100">Проектов</div>
              </div>
              <div className="text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-white" />
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={10} suffix=" лет" />
                </div>
                <div className="mt-1 text-sm text-primary-100">Опыта</div>
              </div>
              <div className="text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-white" />
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={50} suffix="+" />
                </div>
                <div className="mt-1 text-sm text-primary-100">Мастеров</div>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            >
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
                asChild
              >
                <a href="#calculator">
                  Рассчитать стоимость
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <a href="/portfolio">Смотреть портфолио</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div variants={itemVariants} className="flex items-center">
            <div className="w-full rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Заказать звонок
              </h2>
              <p className="mb-6 text-gray-600">
                Оставьте заявку, и наш менеджер свяжется с вами в течение 15
                минут
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Способ связи
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setValue('contactMethod', 'phone')}
                      className={`
                        flex items-center justify-center space-x-1 rounded-lg border-2 p-2 text-xs transition-all
                        ${
                          contactMethod === 'phone'
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Телефон</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('contactMethod', 'telegram')}
                      className={`
                        flex items-center justify-center space-x-1 rounded-lg border-2 p-2 text-xs transition-all
                        ${
                          contactMethod === 'telegram'
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span>Telegram</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('contactMethod', 'whatsapp')}
                      className={`
                        flex items-center justify-center space-x-1 rounded-lg border-2 p-2 text-xs transition-all
                        ${
                          contactMethod === 'whatsapp'
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span>WhatsApp</span>
                    </button>
                  </div>
                  <input
                    type="hidden"
                    {...register('contactMethod')}
                    value={contactMethod}
                  />
                </div>
                <div>
                  <Input
                    {...register('name')}
                    placeholder="Ваше имя"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <InputMask
                        mask="+7 (999) 999-99-99"
                        value={field.value || ''}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        {/* @ts-ignore */}
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            type="tel"
                            placeholder="+7 (999) 123-45-67"
                            className="w-full"
                            disabled={isSubmitting}
                          />
                        )}
                      </InputMask>
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Заказать звонок'}
                </Button>
                {isSuccess && (
                  <p className="text-sm text-green-600">
                    Спасибо! Мы свяжемся с вами в ближайшее время.
                  </p>
                )}
              </form>
              <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>Или позвоните нам: +7 (999) 123-45-67</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
