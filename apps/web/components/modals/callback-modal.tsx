'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import InputMask from 'react-input-mask'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Phone, MessageCircle } from 'lucide-react'
import { api } from '@/lib/api'

const callbackSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  contactMethod: z.enum(['phone', 'telegram', 'whatsapp']),
})

type CallbackFormData = z.infer<typeof callbackSchema>

interface CallbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CallbackModal({ isOpen, onClose }: CallbackModalProps) {
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
        source: 'header',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Заказать звонок">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Способ связи
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setValue('contactMethod', 'phone')}
              className={`
                flex items-center justify-center space-x-2 rounded-lg border-2 p-3 transition-all
                ${
                  contactMethod === 'phone'
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Phone className="h-5 w-5" />
              <span className="text-sm font-medium">Телефон</span>
            </button>
            <button
              type="button"
              onClick={() => setValue('contactMethod', 'telegram')}
              className={`
                flex items-center justify-center space-x-2 rounded-lg border-2 p-3 transition-all
                ${
                  contactMethod === 'telegram'
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Telegram</span>
            </button>
            <button
              type="button"
              onClick={() => setValue('contactMethod', 'whatsapp')}
              className={`
                flex items-center justify-center space-x-2 rounded-lg border-2 p-3 transition-all
                ${
                  contactMethod === 'whatsapp'
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
          </div>
          <input type="hidden" {...register('contactMethod')} value={contactMethod} />
        </div>

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
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Заказать звонок'}
        </Button>

        {isSuccess && (
          <p className="text-center text-sm text-green-600">
            Спасибо! Мы свяжемся с вами в ближайшее время.
          </p>
        )}
      </form>
    </Modal>
  )
}

