'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock } from 'lucide-react'
import { api } from '@/lib/api'

const consultationSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  preferredDate: z.string().min(1, 'Выберите дату'),
  preferredTime: z.string().min(1, 'Выберите время'),
  message: z.string().optional(),
})

type ConsultationFormData = z.infer<typeof consultationSchema>

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
  })

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true)
    try {
      await api.post('/requests', {
        ...data,
        source: 'consultation',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        callbackDate: `${data.preferredDate}T${data.preferredTime}:00`,
      })
      setIsSuccess(true)
      reset()
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Записаться на консультацию">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Ваше имя *
          </label>
          <Input {...register('name')} disabled={isSubmitting} />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Телефон *
          </label>
          <Input
            type="tel"
            placeholder="+7 (999) 123-45-67"
            {...register('phone')}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Calendar className="mr-2 h-4 w-4" />
              Дата *
            </label>
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('preferredDate')}
              disabled={isSubmitting}
            />
            {errors.preferredDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.preferredDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Clock className="mr-2 h-4 w-4" />
              Время *
            </label>
            <Input
              type="time"
              {...register('preferredTime')}
              disabled={isSubmitting}
            />
            {errors.preferredTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.preferredTime.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Сообщение
          </label>
          <textarea
            {...register('message')}
            rows={4}
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Записаться на консультацию'}
        </Button>

        {isSuccess && (
          <p className="text-center text-sm text-green-600">
            Спасибо! Мы свяжемся с вами для подтверждения времени.
          </p>
        )}
      </form>
    </Modal>
  )
}

