import { ReactNode } from 'react'

interface UslugiPageContentProps {
  heroTitle: string
  heroSubtitle: string
  customHtml?: string | null
  defaultBody: ReactNode
}

export function UslugiPageContent({
  heroTitle,
  heroSubtitle,
  customHtml,
  defaultBody,
}: UslugiPageContentProps) {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{heroTitle}</h1>
          <p className="mt-4 text-xl text-primary-200">{heroSubtitle}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {customHtml && customHtml.trim() ? (
            <div
              className="service-page-html space-y-6 text-foreground [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-muted-foreground [&_li]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: customHtml }}
            />
          ) : (
            defaultBody
          )}
        </div>
      </section>
    </div>
  )
}
