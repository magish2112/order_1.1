'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { api, ApiResponse } from '@/lib/api'
import { Employee } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getImageUrl } from '@/lib/utils'

export function Team() {
  const { data: allEmployees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Employee[]>>('/employees?limit=100')
      return response.data
    },
  })

  const designers = allEmployees?.filter((e) => e.department === 'Дизайнеры') || []
  const foremen = allEmployees?.filter((e) => e.department === 'Прорабы') || []

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

  if ((!designers || designers.length === 0) && (!foremen || foremen.length === 0)) {
    return null
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
            <span className="text-sm text-accent font-medium">Наша команда</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Профессиональная команда
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Наши специалисты - это команда профессионалов с многолетним опытом.
            Каждый проект выполняется с максимальным качеством и вниманием к деталям.
          </p>
        </div>

        {/* Дизайнеры */}
        {designers.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-semibold text-gray-900">
              Дизайнеры
            </h3>
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={2}
                navigation={{
                  prevEl: '.designers-prev',
                  nextEl: '.designers-next',
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  768: {
                    slidesPerView: 4,
                  },
                  1024: {
                    slidesPerView: 6,
                  },
                }}
              >
                {designers.map((employee) => (
                  <SwiperSlide key={employee.id}>
                    <div className="group relative overflow-hidden rounded-xl bg-card/50 border border-border backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card/80 hover:shadow-2xl hover:shadow-accent/10 text-center">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/5 transition-all duration-300" />

                      <div className="relative p-6">
                        <div className="mb-4 flex justify-center">
                          {employee.photo && getImageUrl(employee.photo) ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-accent/30 transition-transform group-hover:scale-105 group-hover:border-accent">
                              <Image
                                src={getImageUrl(employee.photo)!}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 border border-border">
                              <User className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="text-xs text-accent font-medium">
                          {employee.position}
                        </p>
                      </div>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent/80 group-hover:w-full transition-all duration-500" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                className="designers-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/80 border border-border p-2 backdrop-blur-sm transition-all hover:bg-accent hover:border-accent lg:-left-4"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-foreground/80 hover:text-foreground" />
              </button>
              <button
                className="designers-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/80 border border-border p-2 backdrop-blur-sm transition-all hover:bg-accent hover:border-accent lg:-right-4"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-foreground/80 hover:text-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Прорабы */}
        {foremen.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-semibold text-gray-900">
              Прорабы
            </h3>
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={2}
                navigation={{
                  prevEl: '.foremen-prev',
                  nextEl: '.foremen-next',
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  768: {
                    slidesPerView: 4,
                  },
                  1024: {
                    slidesPerView: 6,
                  },
                }}
              >
                {foremen.map((employee) => (
                  <SwiperSlide key={employee.id}>
                    <div className="group relative overflow-hidden rounded-xl bg-card/50 border border-border backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card/80 hover:shadow-2xl hover:shadow-accent/10 text-center">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/5 transition-all duration-300" />

                      <div className="relative p-6">
                        <div className="mb-4 flex justify-center">
                          {employee.photo && getImageUrl(employee.photo) ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-accent/30 transition-transform group-hover:scale-105 group-hover:border-accent">
                              <Image
                                src={getImageUrl(employee.photo)!}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 border border-border">
                              <User className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="text-xs text-accent font-medium">
                          {employee.position}
                        </p>
                      </div>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent/80 group-hover:w-full transition-all duration-500" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                className="foremen-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/80 border border-border p-2 backdrop-blur-sm transition-all hover:bg-accent hover:border-accent lg:-left-4"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-foreground/80 hover:text-foreground" />
              </button>
              <button
                className="foremen-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/80 border border-border p-2 backdrop-blur-sm transition-all hover:bg-accent hover:border-accent lg:-right-4"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-foreground/80 hover:text-foreground" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-border text-foreground/80 hover:bg-accent hover:text-foreground hover:border-accent"
            asChild
          >
            <Link href="/o-kompanii">
              Узнать больше о нас
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}
