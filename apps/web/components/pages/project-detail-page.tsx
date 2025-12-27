'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Project } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Square, Calendar, MapPin, DollarSign, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface ProjectDetailPageProps {
  slug: string
}

export function ProjectDetailPage({ slug }: ProjectDetailPageProps) {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => api.get<Project>(`/projects/${slug}`),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-gray-600">Проект не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <section className="border-b border-gray-200 bg-gray-50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Портфолио', href: '/portfolio' },
              { label: project.title },
            ]}
          />
        </div>
      </section>

      {/* Hero Image */}
      {project.coverImage && (
        <section className="relative h-96 w-full overflow-hidden">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </section>
      )}

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white group" asChild>
              <Link href="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к портфолио
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                {project.title}
              </h1>

              {project.description && (
                <p className="mb-6 text-lg text-gray-600">{project.description}</p>
              )}

              {project.content && (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.content }}
                />
              )}

              {/* Before/After Images */}
              {(project.beforeImages || project.afterImages) && (
                <div className="mt-12">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    До и После
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {project.beforeImages?.map((img, index) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                        <Image
                          src={img}
                          alt={`До ремонта ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {project.afterImages?.map((img, index) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                        <Image
                          src={img}
                          alt={`После ремонта ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Review */}
              {project.clientReview && (
                <Card className="mt-12 bg-primary-50">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-xl font-semibold text-gray-900">
                      Отзыв клиента
                    </h3>
                    <p className="mb-4 text-gray-700">{project.clientReview}</p>
                    {project.clientName && (
                      <p className="font-semibold text-gray-900">
                        — {project.clientName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Характеристики проекта
                  </h3>
                  <dl className="space-y-4">
                    {project.area && (
                      <div>
                        <dt className="flex items-center text-sm font-medium text-gray-500">
                          <Square className="mr-2 h-4 w-4" />
                          Площадь
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          {project.area} м²
                        </dd>
                      </div>
                    )}
                    {project.rooms && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Комнаты
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          {project.rooms}
                        </dd>
                      </div>
                    )}
                    {project.duration && (
                      <div>
                        <dt className="flex items-center text-sm font-medium text-gray-500">
                          <Calendar className="mr-2 h-4 w-4" />
                          Срок выполнения
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          {project.duration} дней
                        </dd>
                      </div>
                    )}
                    {project.price && (
                      <div>
                        <dt className="flex items-center text-sm font-medium text-gray-500">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Стоимость
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          {new Intl.NumberFormat('ru-RU').format(project.price)} ₽
                        </dd>
                      </div>
                    )}
                    {project.location && (
                      <div>
                        <dt className="flex items-center text-sm font-medium text-gray-500">
                          <MapPin className="mr-2 h-4 w-4" />
                          Адрес
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {project.location}
                        </dd>
                      </div>
                    )}
                    {project.style && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Стиль
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {project.style}
                        </dd>
                      </div>
                    )}
                    {project.propertyType && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Тип помещения
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {project.propertyType}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <Button className="mt-6 w-full" asChild>
                    <Link href="/kontakty">Заказать консультацию</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

