'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { api } from '@/lib/api'
import { Project } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Square, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Portfolio() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => api.get<Project[]>('/projects/featured?limit=10'),
  })

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="bg-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Наши проекты
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Посмотрите примеры наших работ
            </p>
          </div>
          <Button variant="outline" className="hidden lg:flex" asChild>
            <Link href="/portfolio">
              Все проекты
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
              prevEl: '.portfolio-prev',
              nextEl: '.portfolio-next',
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
              1280: {
                slidesPerView: 4,
              },
            }}
            className="portfolio-swiper"
          >
            {projects?.map((project) => (
              <SwiperSlide key={project.id}>
                <Link href={`/portfolio/${project.slug}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-xl">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      {project.coverImage ? (
                        <Image
                          src={project.coverImage}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-200">
                          <Square className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
                      {project.style && (
                        <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900">
                          {project.style}
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <h3 className="font-semibold">{project.title}</h3>
                      </div>
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
                      {project.area && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Square className="mr-1 h-4 w-4" />
                          {project.area} м²
                          {project.rooms && ` • ${project.rooms} комн.`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            className="portfolio-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-gray-50 disabled:opacity-50 lg:-left-4"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            className="portfolio-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-gray-50 disabled:opacity-50 lg:-right-4"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="mt-8 text-center lg:hidden">
          <Button variant="outline" asChild>
            <Link href="/portfolio">
              Все проекты
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}
