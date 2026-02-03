import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProjectDetailPage } from '@/components/pages/project-detail-page'
import { getApiUrl } from '@/lib/api'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const project = await fetch(getApiUrl(`/projects/${params.slug}`))
      .then((res) => res.json())
      .catch(() => null)
    
    if (!project) {
      return {
        title: 'Проект не найден',
      }
    }
    
    return {
      title: project.title,
      description: project.description || `Проект: ${project.title}`,
      openGraph: {
        title: project.title,
        description: project.description || `Проект: ${project.title}`,
      },
    }
  } catch {
    return {
      title: 'Проект',
    }
  }
}

export default function ProjectDetail({
  params,
}: {
  params: { slug: string }
}) {
  return <ProjectDetailPage slug={params.slug} />
}

