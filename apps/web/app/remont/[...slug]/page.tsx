import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServiceCategoryPage } from '@/components/pages/service-category-page'
import { ServiceDetailPage } from '@/components/pages/service-detail-page'
import { api } from '@/lib/api'

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] }
}): Promise<Metadata> {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  try {
    const data = await fetch(`${process.env.API_URL || 'http://localhost:4000'}/api/v1/categories/${slug}`)
      .then((res) => res.json())
      .catch(() => null)
    
    if (!data) {
      // Попробуем найти услугу
      const service = await fetch(`${process.env.API_URL || 'http://localhost:4000'}/api/v1/services/${slug}`)
        .then((res) => res.json())
        .catch(() => null)
      
      if (service) {
        return {
          title: service.name,
          description: service.description || service.shortDescription || `Услуга: ${service.name}`,
        }
      }
      
      return {
        title: 'Страница не найдена',
      }
    }
    
    return {
      title: data.name,
      description: data.description || data.shortDescription || `Категория: ${data.name}`,
    }
  } catch {
    return {
      title: 'Ремонт',
    }
  }
}

export default function RemontSlugPage({
  params,
}: {
  params: { slug: string[] }
}) {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  return <ServiceCategoryPage categorySlug="remont" slug={slug} />
}

