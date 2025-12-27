'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { api } from '@/lib/api'
import { Article } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Articles() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => api.get<Article[]>('/articles?limit=10'),
  })

  if (isLoading) {
    return (
      <section className="bg-zinc-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-zinc-400">Загрузка...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="relative bg-zinc-950 py-16 lg:py-24 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(251, 191, 36) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(251, 191, 36) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-amber-600/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-orange-600/10 to-transparent blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 backdrop-blur-sm mb-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm text-amber-500 font-medium">Блог</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Полезные статьи
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Советы и рекомендации по ремонту и дизайну интерьеров
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden lg:flex border-zinc-700 text-zinc-300 hover:bg-amber-600 hover:text-white hover:border-amber-600"
            asChild
          >
            <Link href="/stati">
              Все статьи
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative mt-12">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              prevEl: '.articles-prev',
              nextEl: '.articles-next',
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
          >
            {articles.map((article) => (
              <SwiperSlide key={article.id}>
                <Link href={`/stati/${article.slug}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-xl">
                    {article.coverImage && (
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
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
                            <span>Время чтения: {article.readingTime} мин</span>
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
                      <div className="mt-4 flex items-center text-primary-600 group-hover:underline">
                        Читать далее
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className="articles-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-3 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-left-4"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-300 hover:text-white" />
          </button>
          <button
            className="articles-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-3 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-right-4"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-zinc-300 hover:text-white" />
          </button>
        </div>

        <div className="mt-8 text-center lg:hidden">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white group" asChild>
            <Link href="/stati">
              Все статьи
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}
