'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'

const contactFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export function ContactsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      await api.post('/requests', {
        ...data,
        source: 'contacts',
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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Контакты
          </h1>
          <p className="mt-4 text-xl text-primary-100">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Phone className="mb-2 h-8 w-8 text-primary-600" />
                <CardTitle>Телефон</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  +7 (999) 123-45-67
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Ежедневно с 9:00 до 21:00
                </p>
                <Button className="mt-4" asChild>
                  <a href="tel:+79991234567">Позвонить</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="mb-2 h-8 w-8 text-primary-600" />
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  info@remstroy.ru
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Ответим в течение 24 часов
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <a href="mailto:info@remstroy.ru">Написать</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="mb-2 h-8 w-8 text-primary-600" />
                <CardTitle>Адрес</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  г. Москва
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  ул. Примерная, д. 1
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <a
                    href="https://yandex.ru/maps"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Открыть карту
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-primary-600" />
                <CardTitle>Написать нам</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Имя *
                  </label>
                  <Input {...register('name')} disabled={isSubmitting} />
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
                  <Input
                    type="tel"
                    {...register('phone')}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    {...register('email')}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Сообщение *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                </Button>

                {isSuccess && (
                  <p className="text-sm text-green-600">
                    Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в
                    ближайшее время.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="bg-gray-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-96 items-center justify-center rounded-lg bg-gray-300">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-4 text-gray-600">
                Здесь будет карта (Яндекс.Карты / Google Maps)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

