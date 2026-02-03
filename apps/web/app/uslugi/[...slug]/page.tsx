import { Metadata } from 'next'
import { ServiceCategoryPage } from '@/components/pages/service-category-page'
import { getApiUrl } from '@/lib/api'

type Props = { params: { slug: string[] } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  try {
    const data = await fetch(getApiUrl(`/categories/${slug}`))
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
