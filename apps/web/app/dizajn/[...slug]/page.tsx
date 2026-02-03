import { Metadata } from 'next'
import { ServiceCategoryPage } from '@/components/pages/service-category-page'
import { getApiUrl } from '@/lib/api'

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] }
}): Promise<Metadata> {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  try {
    const data = await fetch(getApiUrl(`/categories/${slug}`))
      .then((res) => res.json())
      .catch(() => null)
    
    if (!data) {
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
      title: 'Дизайн',
    }
  }
}

export default function DizajnSlugPage({
  params,
}: {
  params: { slug: string[] }
}) {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  return <ServiceCategoryPage categorySlug="dizajn" slug={slug} />
}

