'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Article } from '@/lib/types'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ArticleDetailPageProps {
  slug: string
}

export function ArticleDetailPage({ slug }: ArticleDetailPageProps) {
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.get<Article>(`/articles/${slug}`),
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

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-gray-600">Статья не найдена</p>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <section className="border-b border-gray-200 bg-gray-50 py-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Статьи', href: '/stati' },
              { label: article.title },
            ]}
          />
        </div>
      </section>

      {/* Header */}
      <header className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Button variant="outline" className="mb-6" asChild>
            <Link href="/stati">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к статьям
            </Link>
          </Button>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {article.publishedAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            )}
            {article.readingTime && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{article.readingTime} мин чтения</span>
              </div>
            )}
            {article.author && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>
                  {article.author.firstName} {article.author.lastName}
                </span>
              </div>
            )}
          </div>

          {article.coverImage && (
            <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {article.excerpt && (
            <p className="mb-8 text-xl font-medium text-gray-700">
              {article.excerpt}
            </p>
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Теги:
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

