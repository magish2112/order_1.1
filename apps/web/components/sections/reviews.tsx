'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { api, ApiResponse } from '@/lib/api'
import { Review, Project } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Reviews() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Review[]>>('/reviews?limit=10')
      return response.data
    },
  })

  const { data: projects } = useQuery({
    queryKey: ['projects-for-reviews'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Project[]>>('/projects?limit=100')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка...</p>
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
      className="relative bg-background py-16 lg:py-24 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--accent)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--accent)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-gradient-to-br from-accent/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-gradient-to-tl from-accent/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-accent font-medium">Отзывы клиентов</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Что говорят о нас
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
                  <div className="group relative h-full overflow-hidden rounded-xl bg-card/50 border border-border backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card/80 hover:shadow-2xl hover:shadow-accent/10">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/5 transition-all duration-300" />

                    <div className="relative p-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Left: Project Images */}
                        {project && projectImages.length > 0 && (
                          <div className="relative">
                            <Swiper
                              modules={[Autoplay]}
                              autoplay={{ delay: 3000 }}
                              className="h-64 rounded-lg overflow-hidden border border-border"
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        )}

                        {/* Right: Review Content */}
                        <div className="flex flex-col">
                          {project && (
                            <h3 className="mb-3 text-xl font-semibold text-foreground">
                              {project.title}
                            </h3>
                          )}
                          <div className="mb-4 flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating
                                    ? 'fill-accent text-accent'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mb-6 flex-1 text-foreground/80 leading-relaxed">
                            &ldquo;{review.content}&rdquo;
                          </p>
                          <div className="flex items-center space-x-3 border-t border-border pt-4">
                            {review.authorPhoto ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-accent/30">
                                <Image
                                  src={review.authorPhoto}
                                  alt={review.authorName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-border">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">
                                {review.authorName}
                              </p>
                              {review.source && (
                                <p className="text-xs text-muted-foreground">
                                  {review.source}
                                </p>
                              )}
                            </div>
                          </div>
                          {project && (
                            <Button
                              className="mt-4 bg-accent hover:bg-accent/90 text-foreground"
                              asChild
                            >
                              <a href={`/portfolio/${project.slug}`}>
                                Смотреть проект
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent/80 group-hover:w-full transition-all duration-500" />
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>

          <button
            className="reviews-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/80 border border-border p-3 backdrop-blur-sm transition-all hover:bg-accent hover:border-accent lg:-left-4"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-foreground/80 hover:text-foreground" />
          </button>
          <button
            className="reviews-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/80 border border-border p-3 backdrop-blur-sm transition-all hover:bg-accent hover:border-accent lg:-right-4"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-foreground/80 hover:text-foreground" />
          </button>
        </div>
      </div>
    </motion.section>
  )
}
