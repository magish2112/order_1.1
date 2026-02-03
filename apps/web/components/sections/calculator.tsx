'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import InputMask from 'react-input-mask'
import { api, ApiResponse } from '@/lib/api'
import { CalculatorConfig } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator as CalculatorIcon, Home, Building2, Briefcase, ChevronRight, Check, Hammer, Wrench, Ruler, Zap, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const calculatorSchema = z.object({
  propertyType: z.enum(['apartment', 'house', 'office']),
  housingType: z.enum(['newBuilding', 'secondary']),
  rooms: z.number().min(1).max(10),
  area: z.number().min(10).max(1000),
  repairType: z.enum(['cosmetic', 'capital', 'design', 'elite']),
  additionalServices: z.array(z.string()).optional(),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
})

type CalculatorFormData = z.infer<typeof calculatorSchema>

const steps = [
  { id: 1, title: 'Тип помещения' },
  { id: 2, title: 'Тип жилья' },
  { id: 3, title: 'Количество комнат' },
  { id: 4, title: 'Площадь' },
  { id: 5, title: 'Тип ремонта' },
  { id: 6, title: 'Доп. услуги' },
  { id: 7, title: 'Контакты' },
]

const additionalServices = [
  { id: 'design-project', label: 'Дизайн-проект', percent: 15 },
  { id: 'demolition', label: 'Демонтаж', percent: 5 },
  { id: 'electrical', label: 'Электрика', percent: 8 },
  { id: 'plumbing', label: 'Сантехника', percent: 10 },
  { id: 'custom-furniture', label: 'Мебель на заказ', percent: 20 },
]

const propertyTypes: Array<{
  value: 'apartment' | 'house' | 'office'
  label: string
  icon: typeof Home
}> = [
  { value: 'apartment', label: 'Квартира', icon: Home },
  { value: 'house', label: 'Частный дом', icon: Building2 },
  { value: 'office', label: 'Офис/Коммерция', icon: Briefcase },
]

const repairTypes: Array<{
  value: 'cosmetic' | 'capital' | 'design' | 'elite'
  label: string
  description: string
  icon: typeof Hammer
}> = [
  { value: 'cosmetic', label: 'Косметический', description: 'Покраска, обои, мелкий ремонт', icon: Hammer },
  { value: 'capital', label: 'Капитальный', description: 'Полный ремонт с заменой коммуникаций', icon: Wrench },
  { value: 'design', label: 'Дизайнерский', description: 'Ремонт по дизайн-проекту', icon: Ruler },
  { value: 'elite', label: 'Элитный', description: 'Премиум материалы и отделка', icon: Zap },
]

export function Calculator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { data: config } = useQuery({
    queryKey: ['calculator-config'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<CalculatorConfig>>('/calculator/config')
      return response.data
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      propertyType: 'apartment',
      housingType: 'secondary',
      rooms: 1,
      area: 50,
      repairType: 'capital',
    },
  })

  const watchedArea = watch('area')
  const watchedRepairType = watch('repairType')
  const watchedHousingType = watch('housingType')
  const watchedPropertyType = watch('propertyType')
  const watchedAdditionalServices = watch('additionalServices') || []

  useEffect(() => {
    if (config && watchedArea && watchedRepairType) {
      const basePrices = {
        cosmetic: Number(config.basePriceCosmetic),
        capital: Number(config.basePriceCapital),
        design: Number(config.basePriceDesign),
        elite: Number(config.basePriceElite),
      }

      const basePrice = basePrices[watchedRepairType]
      const coefficient = config.coefficients[watchedHousingType] || 1.0
      let price = basePrice * Number(watchedArea) * coefficient

      // Добавляем процент за дополнительные услуги
      const additionalPercent = watchedAdditionalServices.reduce((sum, serviceId) => {
        const service = additionalServices.find((s) => s.id === serviceId)
        return sum + (service?.percent || 0)
      }, 0)

      price = price * (1 + additionalPercent / 100)

      const minPrice = price * 0.85
      const maxPrice = price * 1.15

      setPriceRange({ min: Math.round(minPrice), max: Math.round(maxPrice) })
      setEstimatedPrice(Math.round(price))
    }
  }, [watchedArea, watchedRepairType, watchedHousingType, watchedAdditionalServices, config])

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 3:
        return (watchedPropertyType === 'apartment' || watchedPropertyType === 'house') ? (watch('rooms') ?? 1) >= 1 : true
      case 4:
        const area = watch('area')
        return typeof area === 'number' && area >= 10 && area <= 1000
      default:
        return true
    }
  }

  const nextStep = () => {
    if (!isStepValid()) return
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: CalculatorFormData) => {
    try {
      await api.post('/requests', {
        ...data,
        email: data.email?.trim() ? data.email.trim() : undefined,
        source: 'calculator',
        pageUrl: window.location.href,
      })
      
      // Показываем успешное сообщение
      setIsSubmitted(true)
      
      // Сбрасываем форму через 3 секунды
      setTimeout(() => {
        reset()
        setCurrentStep(1)
        setEstimatedPrice(null)
        setPriceRange(null)
        setIsSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Ошибка отправки:', error)
      alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.')
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  return (
    <motion.section
      id="calculator"
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

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm mb-6">
            <CalculatorIcon className="h-6 w-6 text-accent" />
            <span className="text-sm text-accent font-medium">Калькулятор стоимости</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Калькулятор стоимости ремонта
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Рассчитайте примерную стоимость ремонта за несколько минут
          </p>
        </div>

        <div className="mt-12 relative overflow-hidden rounded-xl bg-card/50 border border-border backdrop-blur-sm">
          <div className="relative p-6 lg:p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          currentStep > step.id
                            ? 'border-accent bg-accent text-foreground'
                            : currentStep === step.id
                            ? 'border-accent bg-accent text-foreground'
                            : 'border-zinc-600 bg-muted text-muted-foreground'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">{step.id}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 hidden text-xs font-medium lg:block ${
                          currentStep >= step.id ? 'text-accent' : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-1 flex-1 rounded transition-all ${
                          currentStep > step.id ? 'bg-accent' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isSubmitted ? (
              // Сообщение об успешной отправке
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[400px] flex-col items-center justify-center text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 border border-accent/30">
                  <Check className="h-10 w-10 text-accent" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  Заявка успешно отправлена!
                </h3>
                <p className="mb-2 text-lg text-foreground/80">
                  Спасибо за обращение! Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.
                </p>
                <p className="text-sm text-muted-foreground">
                  Обычно мы перезваниваем в течение 15 минут в рабочее время.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative min-h-[400px] overflow-hidden">
                  <AnimatePresence mode="wait" custom={currentStep}>
                  {/* Step 1: Property Type */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-semibold text-foreground mb-6">
                        Выберите тип помещения
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {propertyTypes.map((type) => {
                          const Icon = type.icon
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => {
                                setValue('propertyType', type.value)
                                setTimeout(nextStep, 300)
                              }}
                              className={`group flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all hover:border-accent/50 ${
                                watchedPropertyType === type.value
                                  ? 'border-accent bg-accent/10 text-accent'
                                  : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="mb-3 h-12 w-12" />
                              <span className="font-semibold">{type.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Housing Type */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      custom={2}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-semibold text-foreground mb-6">
                        Тип жилья
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => {
                            setValue('housingType', 'newBuilding')
                            setTimeout(nextStep, 300)
                          }}
                          className={`group rounded-lg border-2 p-6 text-left transition-all hover:border-accent/50 ${
                            watchedHousingType === 'newBuilding'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border text-foreground/80 hover:bg-card/50'
                          }`}
                        >
                          <h4 className="text-lg font-semibold">Новостройка</h4>
                          <p className="mt-2 text-sm text-gray-600">
                            Ремонт в новой квартире
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setValue('housingType', 'secondary')
                            setTimeout(nextStep, 300)
                          }}
                          className={`group rounded-lg border-2 p-6 text-left transition-all hover:border-accent/50 ${
                            watchedHousingType === 'secondary'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border text-foreground/80 hover:bg-card/50'
                          }`}
                        >
                          <h4 className="text-lg font-semibold">Вторичка</h4>
                          <p className="mt-2 text-sm text-gray-600">
                            Ремонт вторичного жилья
                          </p>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Rooms */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      custom={3}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-semibold text-foreground mb-6">
                        Количество комнат
                      </h3>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        {[1, 2, 3, 4, '5+'].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setValue('rooms', num === '5+' ? 5 : Number(num))
                              setTimeout(nextStep, 300)
                            }}
                            className={`rounded-lg border-2 p-4 text-center font-semibold transition-all hover:border-accent/50 ${
                              watch('rooms') === (num === '5+' ? 5 : Number(num))
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border text-foreground/80 hover:bg-card/50'
                            }`}
                          >
                            {num === '5+' ? '5+' : `${num} комн.`}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Area */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      custom={4}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-semibold text-foreground mb-6">
                        Площадь помещения
                      </h3>
                      <div>
                        <Input
                          type="number"
                          {...register('area', {
                            valueAsNumber: true,
                          })}
                          min={10}
                          max={1000}
                          placeholder="Введите площадь в м²"
                          className="text-lg"
                        />
                        {errors.area && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.area.message}
                          </p>
                        )}
                        <div className="mt-4">
                          <input
                            type="range"
                            min="10"
                            max="500"
                            value={watchedArea || 50}
                            onChange={(e) => setValue('area', Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb"
                            style={{
                              background: `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${((watchedArea || 50) - 10) / (500 - 10) * 100}%, hsl(var(--muted)) ${((watchedArea || 50) - 10) / (500 - 10) * 100}%, hsl(var(--muted)) 100%)`
                            }}
                          />
                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>10 м²</span>
                            <span className="font-semibold text-accent">
                              {watchedArea || 50} м²
                            </span>
                            <span>500 м²</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Repair Type */}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      custom={5}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-semibold text-foreground mb-6">
                        Тип ремонта
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {repairTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setValue('repairType', type.value)
                              // Переход на следующий шаг только если не последний шаг
                              if (currentStep < steps.length) {
                                setTimeout(nextStep, 300)
                              }
                            }}
                            className={`group rounded-lg border-2 p-6 text-left transition-all hover:border-accent/50 ${
                              watchedRepairType === type.value
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border text-foreground/80 hover:bg-card/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg transition-colors ${
                                watchedRepairType === type.value
                                  ? 'bg-accent/20'
                                  : 'bg-muted group-hover:bg-accent/10'
                              }`}>
                                <type.icon className={`h-5 w-5 ${
                                  watchedRepairType === type.value
                                    ? 'text-accent'
                                    : 'text-muted-foreground group-hover:text-accent'
                                }`} />
                              </div>
                              <div>
                                <h4 className={`text-lg font-semibold transition-colors ${
                                  watchedRepairType === type.value
                                    ? 'text-accent-foreground'
                                    : 'text-foreground group-hover:text-accent-foreground'
                                }`}>
                                  {type.label}
                                </h4>
                                <p className={`mt-2 text-sm transition-colors ${
                                  watchedRepairType === type.value
                                    ? 'text-accent/80'
                                    : 'text-muted-foreground group-hover:text-foreground/80'
                                }`}>
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 6: Additional Services */}
                  {currentStep === 6 && (
                    <motion.div
                      key="step6"
                      custom={6}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-semibold text-foreground">
                        Дополнительные услуги
                      </h3>
                      <p className="text-muted-foreground">
                        Выберите дополнительные услуги (необязательно)
                      </p>
                      <div className="space-y-3">
                        {additionalServices.map((service) => (
                          <label
                            key={service.id}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all hover:border-accent/50 ${
                              watchedAdditionalServices.includes(service.id)
                                ? 'border-accent bg-accent/10'
                                : 'border-border hover:bg-card/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={watchedAdditionalServices.includes(service.id)}
                                onChange={(e) => {
                                  const current = watchedAdditionalServices
                                  if (e.target.checked) {
                                    setValue('additionalServices', [...current, service.id])
                                  } else {
                                    setValue(
                                      'additionalServices',
                                      current.filter((id) => id !== service.id)
                                    )
                                  }
                                }}
                                className="custom-checkbox"
                              />
                              <span className={`font-medium transition-colors ${
                                watchedAdditionalServices.includes(service.id)
                                  ? 'text-accent-foreground'
                                  : 'text-foreground/80'
                              }`}>
                                {service.label}
                              </span>
                            </div>
                            <span className={`text-sm font-medium transition-colors ${
                              watchedAdditionalServices.includes(service.id)
                                ? 'text-accent'
                                : 'text-muted-foreground'
                            }`}>
                              +{service.percent}%
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 7: Contacts */}
                  {currentStep === 7 && (
                    <motion.div
                      key="step6"
                      custom={6}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-semibold text-foreground mb-6">
                        Контактные данные
                      </h3>
                      {priceRange && estimatedPrice && (
                        <div className="space-y-4">
                          <div className="rounded-lg bg-primary-50 p-6">
                            <p className="text-sm font-medium text-primary-900">
                              Примерная стоимость:
                            </p>
                            <p className="mt-2 text-3xl font-bold text-primary-600">
                              от {formatPrice(priceRange.min)} до {formatPrice(priceRange.max)}
                            </p>
                            <p className="mt-2 text-xs text-primary-700">
                              *Точная стоимость будет рассчитана после выезда специалиста
                            </p>
                          </div>
                          
                          {/* Сроки выполнения */}
                          <div className="rounded-lg bg-gray-50 p-6">
                            <p className="text-sm font-medium text-gray-900">
                              Примерный срок выполнения:
                            </p>
                            <p className="mt-2 text-xl font-semibold text-gray-700">
                              {watchedRepairType === 'cosmetic' && '1-2 месяца'}
                              {watchedRepairType === 'capital' && '2-4 месяца'}
                              {watchedRepairType === 'design' && '3-5 месяцев'}
                              {watchedRepairType === 'elite' && '4-6 месяцев'}
                            </p>
                          </div>

                          {/* Разбивка по видам работ */}
                          <div className="rounded-lg bg-gray-50 p-6">
                            <p className="mb-3 text-sm font-medium text-gray-900">
                              В стоимость включено:
                            </p>
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-primary-600" />
                                Подготовительные работы
                              </li>
                              <li className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-primary-600" />
                                Черновые материалы
                              </li>
                              <li className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-primary-600" />
                                Чистовая отделка
                              </li>
                              <li className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-primary-600" />
                                Работы мастеров
                              </li>
                              {watchedAdditionalServices.includes('design-project') && (
                                <li className="flex items-center">
                                  <Check className="mr-2 h-4 w-4 text-primary-600" />
                                  Разработка дизайн-проекта
                                </li>
                              )}
                              {watchedAdditionalServices.length > 0 && (
                                <li className="flex items-center text-foreground">
                                  <Check className="mr-2 h-4 w-4 text-accent" />
                                  Дополнительные услуги ({watchedAdditionalServices.length})
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Имя *
                          </label>
                          <Input {...register('name')} />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Телефон *
                          </label>
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
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email (необязательно)
                          </label>
                          <Input type="email" {...register('email')} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="bg-accent hover:bg-accent/90 text-foreground disabled:opacity-50 group"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Назад
                    </Button>
                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className="bg-accent hover:bg-accent/90 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Далее
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-accent hover:bg-accent/90 text-foreground disabled:opacity-50"
                      >
                        {isSubmitting ? 'Отправка...' : 'Получить расчет'}
                      </Button>
                    )}
                  </div>
                </form>
              )}
          </div>
      </div>
    </div>
    </motion.section>
  )
}
