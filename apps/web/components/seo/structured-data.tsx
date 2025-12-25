export interface StructuredDataProps {
  type: 'Organization' | 'LocalBusiness' | 'Service' | 'Article' | 'BreadcrumbList' | 'FAQPage'
  data: Record<string, unknown>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function OrganizationSchema() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: 'РемСтрой',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+7-999-123-45-67',
          contactType: 'customer service',
          availableLanguage: 'Russian',
        },
        sameAs: [
          'https://facebook.com/remstroy',
          'https://instagram.com/remstroy',
          'https://vk.com/remstroy',
        ],
      }}
    />
  )
}

export function LocalBusinessSchema() {
  return (
    <StructuredData
      type="LocalBusiness"
      data={{
        name: 'РемСтрой',
        image: 'https://example.com/logo.png',
        '@id': 'https://example.com',
        url: 'https://example.com',
        telephone: '+7-999-123-45-67',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ул. Примерная, д. 1',
          addressLocality: 'Москва',
          addressCountry: 'RU',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '55.7558',
          longitude: '37.6173',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '09:00',
          closes: '21:00',
        },
      }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  return (
    <StructuredData
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  )
}

export function ServiceSchema({ service }: { service: { name: string; description?: string; priceFrom?: number } }) {
  return (
    <StructuredData
      type="Service"
      data={{
        name: service.name,
        description: service.description,
        provider: {
          '@type': 'LocalBusiness',
          name: 'РемСтрой',
        },
        areaServed: {
          '@type': 'City',
          name: 'Москва',
        },
        ...(service.priceFrom && {
          offers: {
            '@type': 'Offer',
            price: service.priceFrom,
            priceCurrency: 'RUB',
          },
        }),
      }}
    />
  )
}

export function ArticleSchema({
  article,
}: {
  article: {
    title: string
    description?: string
    image?: string
    publishedAt?: string
    author?: { name: string }
  }
}) {
  return (
    <StructuredData
      type="Article"
      data={{
        headline: article.title,
        description: article.description,
        image: article.image,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        author: article.author
          ? {
              '@type': 'Person',
              name: article.author.name,
            }
          : {
              '@type': 'Organization',
              name: 'РемСтрой',
            },
        publisher: {
          '@type': 'Organization',
          name: 'РемСтрой',
          logo: {
            '@type': 'ImageObject',
            url: 'https://example.com/logo.png',
          },
        },
      }}
    />
  )
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  return (
    <StructuredData
      type="FAQPage"
      data={{
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  )
}

