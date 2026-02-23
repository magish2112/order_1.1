import { getApiUrl } from './api'

export interface ServicePageContent {
  metaTitle?: string
  metaDescription?: string
  heroTitle?: string
  heroSubtitle?: string
  content?: string
}

const PAGE_KEYS: Record<string, string> = {
  remont: 'page_uslugi_remont',
  dizajn: 'page_uslugi_dizajn',
  komplektaciya: 'page_uslugi_komplektaciya',
  mebel: 'page_uslugi_mebel',
}

export async function getServicePageContent(
  slug: 'remont' | 'dizajn' | 'komplektaciya' | 'mebel'
): Promise<ServicePageContent | null> {
  const key = PAGE_KEYS[slug]
  if (!key) return null
  try {
    const res = await fetch(getApiUrl('/settings/public'), { next: { revalidate: 300 } })
    if (!res.ok) return null
    const json = await res.json()
    const data = json?.data ?? json
    const raw = data?.[key]
    if (raw == null) return null
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as ServicePageContent
      } catch {
        return { content: raw }
      }
    }
    return raw as ServicePageContent
  } catch {
    return null
  }
}
