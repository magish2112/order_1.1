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
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Загрузка...</p>
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
      className="bg-gray-50 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Отзывы клиентов
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Что говорят о нас наши клиенты
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
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Left: Project Images */}
                        {project && projectImages.length > 0 && (
                          <div className="relative">
                            <Swiper
                              modules={[Autoplay]}
                              autoplay={{ delay: 3000 }}
                              className="h-64 rounded-lg overflow-hidden"
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
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        )}

                        {/* Right: Review Content */}
                        <div className="flex flex-col">
                          {project && (
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                              {project.title}
                            </h3>
                          )}
                          <div className="mb-4 flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mb-4 flex-1 text-gray-700">
                            {review.content}
                          </p>
                          <div className="flex items-center space-x-3 border-t border-gray-200 pt-4">
                            {review.authorPhoto ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                <Image
                                  src={review.authorPhoto}
                                  alt={review.authorName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {review.authorName}
                              </p>
                              {review.source && (
                                <p className="text-xs text-gray-500">
                                  {review.source}
                                </p>
                              )}
                            </div>
                          </div>
                          {project && (
                            <Button className="mt-4" variant="outline" asChild>
                              <Link href={`/portfolio/${project.slug}`}>
                                Смотреть проект
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              )
            })}
          </Swiper>

          <button
            className="reviews-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-gray-50 lg:-left-4"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            className="reviews-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-gray-50 lg:-right-4"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </motion.section>
  )
}
