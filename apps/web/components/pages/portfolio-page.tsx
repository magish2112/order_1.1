'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { api, ApiResponse } from '@/lib/api'
import { Project } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Square, Search } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

export function PortfolioPage() {
  const [filters, setFilters] = useState({
    propertyType: '',
    rooms: '',
    style: '',
    repairType: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const limit = 12

  const { data, isLoading } = useQuery({
    queryKey: ['projects', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (filters.propertyType) params.set('propertyType', filters.propertyType)
      if (filters.rooms) params.set('rooms', filters.rooms)
      if (filters.style) params.set('style', filters.style)
      if (filters.repairType) params.set('repairType', filters.repairType)
      if (filters.search) params.set('search', filters.search)
      const response = await api.get<ApiResponse<Project[]>>(`/projects?${params.toString()}`)
      return {
        projects: response.data,
        total: response.pagination?.total || 0,
      }
    },
  })

  const projects = data?.projects || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Портфолио наших работ
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Более 500+ успешно выполненных проектов
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по проектам..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.propertyType}
                onChange={(e) =>
                  setFilters({ ...filters, propertyType: e.target.value })
                }
                className="h-10 rounded-lg border border-gray-300 px-3"
              >
                <option value="">Тип помещения</option>
                <option value="квартира">Квартира</option>
                <option value="дом">Дом</option>
                <option value="офис">Офис</option>
              </select>
              <select
                value={filters.rooms}
                onChange={(e) =>
                  setFilters({ ...filters, rooms: e.target.value })
                }
                className="h-10 rounded-lg border border-gray-300 px-3"
              >
                <option value="">Комнаты</option>
                <option value="1">1 комната</option>
                <option value="2">2 комнаты</option>
                <option value="3">3 комнаты</option>
                <option value="4">4+ комнаты</option>
              </select>
              <select
                value={filters.style}
                onChange={(e) =>
                  setFilters({ ...filters, style: e.target.value })
                }
                className="h-10 rounded-lg border border-gray-300 px-3"
              >
                <option value="">Стиль</option>
                <option value="современный">Современный</option>
                <option value="лофт">Лофт</option>
                <option value="классика">Классика</option>
                <option value="скандинавский">Скандинавский</option>
              </select>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    propertyType: '',
                    rooms: '',
                    style: '',
                    repairType: '',
                    search: '',
                  })
                }
              >
                Сбросить
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <p className="text-gray-600">Загрузка проектов...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600">Проекты не найдены</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link key={project.id} href={`/portfolio/${project.slug}`}>
                    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        {project.coverImage && getImageUrl(project.coverImage) ? (
                          <Image
                            src={getImageUrl(project.coverImage)!}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-200">
                            <Square className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        {project.style && (
                          <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900">
                            {project.style}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="line-clamp-2 text-sm text-gray-600">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                          {project.area && (
                            <div className="flex items-center">
                              <Square className="mr-1 h-4 w-4" />
                              {project.area} м²
                              {project.rooms && ` • ${project.rooms} комн.`}
                            </div>
                          )}
                          {project.price && (
                            <div className="font-medium text-primary-600">
                              от {new Intl.NumberFormat('ru-RU').format(project.price)} ₽
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    className="bg-accent600 hover:bg-accent700 text-foreground disabled:opacity-50 group"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                  <span className="text-sm text-gray-600">
                    Страница {page} из {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    className="bg-accent600 hover:bg-accent700 text-foreground disabled:opacity-50 group"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Вперед
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

