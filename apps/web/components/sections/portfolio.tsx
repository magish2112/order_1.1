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
      <section className="bg-zinc-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-zinc-400">Загрузка...</p>
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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 backdrop-blur-sm mb-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm text-amber-500 font-medium">Наши проекты</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Реализованные проекты
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Качество и профессионализм в каждом проекте. Посмотрите наши лучшие работы.
            </p>
          </div>
          <Button
            className="hidden lg:flex bg-amber-600 hover:bg-amber-700 text-white group"
            asChild
          >
            <Link href="/portfolio">
              Все проекты
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                  <div className="group relative h-full overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-amber-600/10">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300" />

                    <div className="relative">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
                        {project.coverImage ? (
                          <Image
                            src={project.coverImage}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-zinc-800">
                            <Square className="h-12 w-12 text-zinc-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/0 to-zinc-900/0 opacity-0 transition-opacity group-hover:opacity-100" />
                        {project.style && (
                          <div className="absolute top-4 left-4 rounded-full bg-amber-600/90 px-3 py-1 text-xs font-medium text-white border border-amber-500/30">
                            {project.style}
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <h3 className="font-semibold">{project.title}</h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="mb-3 font-semibold text-white group-hover:text-amber-100 transition-colors">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="line-clamp-2 text-sm text-zinc-400 mb-3">
                            {project.description}
                          </p>
                        )}
                        {project.area && (
                          <div className="flex items-center text-sm text-zinc-500">
                            <Square className="mr-2 h-4 w-4 text-amber-500" />
                            {project.area} м²
                            {project.rooms && ` • ${project.rooms} комн.`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-500" />
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            className="portfolio-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-3 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 disabled:opacity-50 lg:-left-4"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-300 hover:text-white" />
          </button>
          <button
            className="portfolio-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/80 border border-zinc-700 p-3 backdrop-blur-sm transition-all hover:bg-amber-600 hover:border-amber-600 disabled:opacity-50 lg:-right-4"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-zinc-300 hover:text-white" />
          </button>
        </div>

        <div className="mt-8 text-center lg:hidden">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white group"
            asChild
          >
            <Link href="/portfolio">
              Все проекты
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}
