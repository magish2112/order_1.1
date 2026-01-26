import { Metadata } from 'next'
import { ServiceCategoryPage } from '@/components/pages/service-category-page'

type Props = { params: { slug: string[] } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000'
  try {
    const data = await fetch(`${apiBase}/api/v1/categories/${slug}`)
      .then((res) => res.json())
      .catch(() => null)
    if (data?.data) {
      const c = data.data
      return {
        title: c.name,
        description: c.description || c.shortDescription || `Услуга: ${c.name}`,
      }
    }
  } catch {
    // ignore
  }
  return { title: 'Услуга | Прочие услуги' }
}

export default function UslugiSlugPage({ params }: Props) {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  return <ServiceCategoryPage categorySlug="uslugi" slug={slug} />
}
