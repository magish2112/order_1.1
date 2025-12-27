'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger'
  children: React.ReactNode
}

const variantStyles = {
  default: {
    bg: 'bg-purple-600',
    hoverBg: 'hover:bg-purple-700',
  },
  primary: {
    bg: 'bg-primary-600',
    hoverBg: 'hover:bg-primary-700',
  },
  secondary: {
    bg: 'bg-gray-600',
    hoverBg: 'hover:bg-gray-700',
  },
  success: {
    bg: 'bg-green-600',
    hoverBg: 'hover:bg-green-700',
  },
  danger: {
    bg: 'bg-red-600',
    hoverBg: 'hover:bg-red-700',
  },
}

export const AnimatedButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  AnimatedButtonProps
>(({ className, href, variant = 'default', children, ...props }, ref) => {
  const variantStyle = variantStyles[variant]

  const buttonContent = (
    <>
      <span
        className={cn(
          'w-48 h-48 rounded rotate-[-40deg] absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0',
          variantStyle.bg
        )}
      />
      <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
        {children}
      </span>
    </>
  )

  const commonClasses = cn(
    'relative inline-flex items-center justify-start px-6 py-2 overflow-hidden font-medium transition-all bg-white rounded hover:bg-white group outline outline-1',
    className
  )

  if (href) {
    return (
      <Link
        href={href}
        className={commonClasses}
        ref={ref as React.LegacyRef<HTMLAnchorElement>}
      >
        {buttonContent}
      </Link>
    )
  }

  return (
    <button
      className={commonClasses}
      ref={ref as React.LegacyRef<HTMLButtonElement>}
      {...props}
    >
      {buttonContent}
    </button>
  )
})

AnimatedButton.displayName = 'AnimatedButton'

// Экспортируем компонент для демо
export const Component = AnimatedButton

