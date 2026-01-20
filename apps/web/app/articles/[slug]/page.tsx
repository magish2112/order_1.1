import { redirect } from 'next/navigation'

type PageProps = {
  params: {
    slug: string
  }
}

export default function ArticleSlugRedirectPage({ params }: PageProps) {
  redirect(`/stati/${params.slug}`)
}
