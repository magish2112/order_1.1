'use client'

import Link from 'next/link'
import Image from 'next/image'

interface FooterLogoLinkProps {
  logoUrl: string
}

export function FooterLogoLink({ logoUrl }: FooterLogoLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/')
      }
    }
  }

  return (
    <Link href="/" onClick={handleClick} className="flex items-center space-x-3 mb-4 group">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <Image
          src={logoUrl}
          alt="ETERNO STROY"
          width={48}
          height={48}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          unoptimized={logoUrl.startsWith('http')}
        />
      </div>
      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
    </Link>
  )
}
