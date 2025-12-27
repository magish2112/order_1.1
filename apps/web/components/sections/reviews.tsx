'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { api } from '@/lib/api'
import { Review, Project } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Reviews() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.get<Review[]>('/reviews?limit=10'),
  })

  const { data: projects } = useQuery({
    queryKey: ['projects-for-reviews'],
    queryFn: () => api.get<Project[]>('/projects?limit=100'),
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

  if (!reviews || reviews.length === 0) {
    return null
  }

  const getProjectForReview = (review: Review) => {
    if (!review.projectId || !projects) return null
    return projects.find((p) => p.id === review.projectId)
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
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-gradient-to-br from-amber-600/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-gradient-to-tl from-orange-600/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm text-amber-500 font-medium">Отзывы клиентов</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Что говорят о нас
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Реальные отзывы от наших клиентов. Качество работы и профессионализм - наша визитная карточка.
          </p>
        </div>

        <div className="relative mt-12">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              prevEl: '.reviews-prev',
              nextEl: '.reviews-next',
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              1024: {
                slidesPerView: 2,
              },
            }}
          >
            {reviews.map((review) => {
              const project = getProjectForReview(review)
              const projectImages = project
                ? [...(project.beforeImages || []), ...(project.afterImages || [])]
                : []

              return (
                <SwiperSlide key={review.id}>
                  <div className="group relative h-full overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-amber-600/10">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300" />

                    <div className="relative p-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Left: Project Images */}
                        {project && projectImages.length > 0 && (
                          <div className="relative">
                            <Swiper
                              modules={[Autoplay]}
                              autoplay={{ delay: 3000 }}
                              className="h-64 rounded-lg overflow-hidden border border-zinc-700"
                            >
                              {projectImages.slice(0, 5).map((img, idx) => (
                                <SwiperSlide key={idx}>
                                  <div className="relative h-full w-full">
                                    <Image
                                      src={img}
                                      alt={`Проект ${idx + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 to-transparent" />
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        )}

                        {/* Right: Review Content */}
                        <div className="flex flex-col">
                          {project && (
                            <h3 className="mb-3 text-xl font-semibold text-white">
                              {project.title}
                            </h3>
                          )}
                          <div className="mb-4 flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-600'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mb-6 flex-1 text-zinc-300 leading-relaxed">
                            &ldquo;{review.content}&rdquo;
                          </p>
                          <div className="flex items-center space-x-3 border-t border-zinc-700 pt-4">
                            {review.authorPhoto ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-amber-600/30">
                                <Image
                                  src={review.authorPhoto}
                                  alt={review.authorName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                                <User className="h-5 w-5 text-zinc-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-white">
                                {review.authorName}
                              </p>
                              {review.source && (
                                <p className="text-xs text-zinc-500">
                                  {review.source}
                                </p>
                              )}
                            </div>
                          </div>
                          {project && (
                            <Button
                              className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
                              asChild
                            >
                              <Link href={`/portfolio/${project.slug}`}>
                                Смотреть проект
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-500" />
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>

          <button
            className="reviews-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-3 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-left-4"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-300 hover:text-white" />
          </button>
          <button
            className="reviews-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-3 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-right-4"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-zinc-300 hover:text-white" />
          </button>
        </div>
      </div>
    </motion.section>
  )
}
