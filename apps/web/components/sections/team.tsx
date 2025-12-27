'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { api } from '@/lib/api'
import { Employee } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function Team() {
  const { data: allEmployees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.get<Employee[]>('/employees'),
  })

  const designers = allEmployees?.filter((e) => e.department === 'Дизайнеры') || []
  const foremen = allEmployees?.filter((e) => e.department === 'Прорабы') || []

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

  if ((!designers || designers.length === 0) && (!foremen || foremen.length === 0)) {
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
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-gradient-to-br from-amber-600/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-gradient-to-tl from-orange-600/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm text-amber-500 font-medium">Наша команда</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Профессиональная команда
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
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
                    <div className="group relative overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-amber-600/10 text-center">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300" />

                      <div className="relative p-6">
                        <div className="mb-4 flex justify-center">
                          {employee.photo ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-amber-600/30 transition-transform group-hover:scale-105 group-hover:border-amber-500">
                              <Image
                                src={employee.photo}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                              <User className="h-12 w-12 text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="text-xs text-amber-500 font-medium">
                          {employee.position}
                        </p>
                      </div>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-500" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                className="designers-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-2 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-left-4"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-zinc-300 hover:text-white" />
              </button>
              <button
                className="designers-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-2 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-right-4"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-zinc-300 hover:text-white" />
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
                    <div className="group relative overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-amber-600/10 text-center">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300" />

                      <div className="relative p-6">
                        <div className="mb-4 flex justify-center">
                          {employee.photo ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-amber-600/30 transition-transform group-hover:scale-105 group-hover:border-amber-500">
                              <Image
                                src={employee.photo}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                              <User className="h-12 w-12 text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="text-xs text-amber-500 font-medium">
                          {employee.position}
                        </p>
                      </div>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-500" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                className="foremen-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-2 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-left-4"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-zinc-300 hover:text-white" />
              </button>
              <button
                className="foremen-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-2 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 lg:-right-4"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-zinc-300 hover:text-white" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-zinc-700 text-zinc-300 hover:bg-amber-600 hover:text-white hover:border-amber-600"
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
