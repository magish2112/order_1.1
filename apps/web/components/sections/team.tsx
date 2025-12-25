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
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Загрузка...</p>
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
      className="bg-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Наша команда
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Профессионалы с многолетним опытом работы
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
                    <Card className="group text-center transition-all hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="mb-3 flex justify-center">
                          {employee.photo ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-full transition-transform group-hover:scale-105">
                              <Image
                                src={employee.photo}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                              <User className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="mt-1 text-xs text-primary-600">
                          {employee.position}
                        </p>
                      </CardContent>
                    </Card>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                className="designers-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-50 lg:-left-4"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                className="designers-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-50 lg:-right-4"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
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
                    <Card className="group text-center transition-all hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="mb-3 flex justify-center">
                          {employee.photo ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-full transition-transform group-hover:scale-105">
                              <Image
                                src={employee.photo}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                              <User className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="mt-1 text-xs text-primary-600">
                          {employee.position}
                        </p>
                      </CardContent>
                    </Card>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                className="foremen-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-50 lg:-left-4"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                className="foremen-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-50 lg:-right-4"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
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
