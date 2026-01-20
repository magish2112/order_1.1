'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Article } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Search } from 'lucide-react'
import { formatDate, getImageUrl } from '@/lib/utils'

export function ArticlesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 12

  const { data, isLoading } = useQuery({
    queryKey: ['articles', search, page],
    queryFn: () =>
      api.get<{ articles: Article[]; total: number }>(
        `/articles?page=${page}&limit=${limit}&search=${search}`
      ),
  })

  const articles = data?.articles || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Статьи и полезные материалы
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Советы от профессионалов по ремонту и дизайну
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="border-b border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск по статьям..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <p className="text-gray-600">Загрузка статей...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600">Статьи не найдены</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link key={article.id} href={`/stati/${article.slug}`}>
                    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                      {article.coverImage && getImageUrl(article.coverImage) && (
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image
                            src={getImageUrl(article.coverImage)!}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="mb-3 flex items-center space-x-4 text-sm text-gray-500">
                          {article.publishedAt && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                          )}
                          {article.readingTime && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{article.readingTime} мин</span>
                            </div>
                          )}
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="line-clamp-3 text-gray-600">
                            {article.excerpt}
                          </p>
                        )}
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

