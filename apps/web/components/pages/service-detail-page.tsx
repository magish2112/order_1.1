'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Service } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { ServiceSchema, BreadcrumbSchema } from '@/components/seo/structured-data'

interface ServiceDetailPageProps {
  serviceSlug: string
  categorySlug?: string
}

export function ServiceDetailPage({ serviceSlug, categorySlug = 'remont' }: ServiceDetailPageProps) {
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceSlug],
    queryFn: () => api.get<Service>(`/services/${serviceSlug}`),
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

  if (!service) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-gray-600">Услуга не найдена</p>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: categorySlug === 'remont' ? 'Ремонт' : categorySlug === 'dizajn' ? 'Дизайн' : 'Услуги', href: `/${categorySlug}` },
    ...(service.category ? [{ label: service.category.name, href: `/${categorySlug}/${service.category.slug}` }] : []),
    { label: service.name },
  ]

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com'

  return (
    <div className="min-h-screen bg-white">
      <ServiceSchema
        service={{
          name: service.name,
          description: service.description || service.shortDescription,
          priceFrom: service.priceFrom,
        }}
      />
      <BreadcrumbSchema
        items={breadcrumbItems.map((item, index, arr) => ({
          name: item.label,
          url: index < arr.length - 1 ? `${baseUrl}${item.href}` : baseUrl,
        }))}
      />
      {/* Breadcrumbs */}
      <section className="border-b border-gray-200 bg-gray-50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </section>

      {/* Hero Image */}
      {service.image && getImageUrl(service.image) && (
        <section className="relative h-96 w-full overflow-hidden">
          <Image src={getImageUrl(service.image)!} alt={service.name} fill className="object-cover" priority />
        </section>
      )}

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button className="bg-accent600 hover:bg-accent700 text-foreground group" asChild>
              <Link href={service.category ? `/${categorySlug}/${service.category.slug}` : `/${categorySlug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">{service.name}</h1>

              {service.description && (
                <p className="mb-6 text-lg text-gray-600">{service.description}</p>
              )}

              {service.content && (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.content }}
                />
              )}

              {/* Gallery */}
              {service.gallery && service.gallery.length > 0 && (
                <div className="mt-12">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Галерея работ</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {service.gallery.map((img, index) => (
                      <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                        <Image src={img} alt={`${service.name} - фото ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">Информация об услуге</h3>
                  <dl className="space-y-4">
                    {(service.priceFrom || service.priceTo) && (
                      <div>
                        <dt className="flex items-center text-sm font-medium text-gray-500">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Стоимость
                        </dt>
                        <dd className="mt-1">
                          {service.priceFrom && (
                            <span className="text-2xl font-bold text-primary-600">
                              от {formatPrice(service.priceFrom)}
                            </span>
                          )}
                          {service.priceTo && (
                            <span className="ml-2 text-2xl font-bold text-primary-600">
                              до {formatPrice(service.priceTo)}
                            </span>
                          )}
                          {service.priceUnit && (
                            <p className="mt-1 text-sm text-gray-500">{service.priceUnit}</p>
                          )}
                        </dd>
                      </div>
                    )}
                    {service.duration && (
                      <div>
                        <dt className="flex items-center text-sm font-medium text-gray-500">
                          <Clock className="mr-2 h-4 w-4" />
                          Срок выполнения
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">{service.duration}</dd>
                      </div>
                    )}
                  </dl>
                  <Button className="mt-6 w-full" size="lg" asChild>
                    <Link href="/kontakty">Заказать услугу</Link>
                  </Button>
                  <Button className="mt-3 w-full bg-accent600 hover:bg-accent700 text-foreground group" asChild>
                    <Link href="/kalkulyator">Рассчитать стоимость</Link>
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
