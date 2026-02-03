import { Metadata } from 'next'
import { ArticleDetailPage } from '@/components/pages/article-detail-page'
import { getApiUrl } from '@/lib/api'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const article = await fetch(getApiUrl(`/articles/${params.slug}`))
      .then((res) => res.json())
      .catch(() => null)
    
    if (!article) {
      return {
        title: 'Статья не найдена',
      }
    }
    
    return {
      title: article.title,
      description: article.excerpt || article.metaDescription || `Статья: ${article.title}`,
      openGraph: {
        title: article.title,
        description: article.excerpt || article.metaDescription || `Статья: ${article.title}`,
        images: article.coverImage ? [article.coverImage] : [],
      },
    }
  } catch {
    return {
      title: 'Статья',
    }
  }
}

export default function ArticleDetail({
  params,
}: {
  params: { slug: string }
}) {
  return <ArticleDetailPage slug={params.slug} />
}

