'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { api, ApiResponse } from '@/lib/api'
import { ServiceCategory, Service } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Square, CheckCircle2 } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'

interface ServiceCategoryPageProps {
  categorySlug: string
  slug?: string
}

export function ServiceCategoryPage({ categorySlug, slug }: ServiceCategoryPageProps) {
  const categoryPath = slug ? `${categorySlug}/${slug}` : categorySlug

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryPath],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ServiceCategory>>(`/categories/${categoryPath}`)
      return response.data
    },
    enabled: !!categoryPath,
  })

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['category-services', category?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Service[]>>(`/services?categoryId=${category?.id}`)
      return response.data
    },
    enabled: !!category?.id,
  })

  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
    queryKey: ['subcategories', category?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ServiceCategory[]>>(`/categories?parentId=${category?.id}`)
      return response.data
    },
    enabled: !!category?.id,
  })

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-gray-600">Категория не найдена</p>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: categorySlug === 'remont' ? 'Ремонт' : categorySlug === 'dizajn' ? 'Дизайн' : 'Услуги', href: `/${categorySlug}` },
    ...(slug ? [{ label: category.name }] : []),
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-700 py-16 text-foreground">
        {category.image && getImageUrl(category.image) && (
          <div className="absolute inset-0 opacity-20">
            <Image src={getImageUrl(category.image)!} alt={category.name} fill className="object-cover" />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-6 text-primary-100" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-4 text-xl text-primary-100">{category.description}</p>
          )}
        </div>
      </section>

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <section className="border-b border-gray-200 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Подкатегории</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subcategories.map((subcat) => (
                <Link key={subcat.id} href={`/${categorySlug}/${subcat.slug}`}>
                  <Card className="group transition-all hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary-600 transition-colors">
                        {subcat.name}
                      </CardTitle>
                      {subcat.shortDescription && (
                        <p className="text-sm text-gray-600">{subcat.shortDescription}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full group-hover:bg-primary-600 group-hover:text-foreground">
                        Подробнее
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services && services.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Наши услуги</h2>
            {servicesLoading ? (
              <p className="text-gray-600">Загрузка услуг...</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <Link key={service.id} href={`/${categorySlug}/${category.slug}/${service.slug}`}>
                    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                      {service.image && getImageUrl(service.image) && (
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image
                            src={getImageUrl(service.image)!}
                            alt={service.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary-600 transition-colors">
                          {service.name}
                        </CardTitle>
                        {service.shortDescription && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {service.shortDescription}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        {service.priceFrom && (
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-primary-600">
                              от {formatPrice(service.priceFrom)}
                            </p>
                            {service.priceUnit && (
                              <p className="text-sm text-gray-500">{service.priceUnit}</p>
                            )}
                          </div>
                        )}
                        <Button variant="outline" className="w-full group-hover:bg-primary-600 group-hover:text-foreground">
                          Подробнее
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Content Section */}
      {category.content && (
        <section className="bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: category.content }}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary-600 py-12 text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Готовы начать проект?</h2>
            <p className="mt-4 text-xl text-primary-100">
              Свяжитесь с нами для бесплатной консультации
            </p>
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button size="lg" className="bg-accent600 hover:bg-accent700 text-foreground" asChild>
                <Link href="/kontakty">Связаться с нами</Link>
              </Button>
              <Button size="lg" className="bg-accent600 hover:bg-accent700 text-foreground group" asChild>
                <Link href="/kalkulyator">Рассчитать стоимость</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

