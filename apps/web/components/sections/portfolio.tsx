'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { api, ApiResponse } from '@/lib/api'
import { Project } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/utils'

export function Portfolio() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Project[]>>('/projects/featured?limit=10')
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

  const featuredProjects = projects?.slice(0, 4) || []

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="relative py-20"
      style={{ backgroundColor: 'rgba(23, 39, 28, 0.03)' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 text-white border-0" style={{ backgroundColor: 'hsl(var(--accent))' }}>
            Портфолио
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Наши реализованные проекты
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            Каждый проект — это уникальная история успеха и воплощение мечты наших клиентов
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <a href={`/portfolio/${project.slug}`}>
                <Card className="overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer border-accent/50 bg-card">
                  <div className="relative h-64 overflow-hidden">
                    {project.coverImage && getImageUrl(project.coverImage) ? (
                      <Image
                        src={getImageUrl(project.coverImage)!}
                        alt={project.title}
                        fill
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <Square className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      {project.style && (
                        <Badge className="text-white border-0" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                          {project.style}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-sm mb-4 text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {project.area && (
                      <p className="text-sm mb-4 text-muted-foreground">
                        {project.area} м²
                        {project.rooms && ` • ${project.rooms} комн.`}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all">
                      Смотреть проект
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground group rounded-full"
            asChild
          >
            <a href="/portfolio">
              Все проекты
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  )
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}
