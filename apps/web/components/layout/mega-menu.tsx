'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ServiceCategory } from '@/lib/types'

interface MegaMenuProps {
  category: {
    name: string
    href: string
    image?: string
    children?: Array<{
      name: string
      href: string
      image?: string
      children?: Array<{
        name: string
        href: string
      }>
    }>
  }
  isOpen: boolean
  onClose: () => void
}

export function MegaMenu({ category, isOpen, onClose }: MegaMenuProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      onClose()
    }, 150)
  }

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  if (!category.children || category.children.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute left-1/2 top-full z-50 mt-1 w-screen max-w-4xl -translate-x-1/2 rounded-lg border border-gray-200 bg-white shadow-xl"
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* Left Column - Subcategories */}
            <div className="col-span-2 space-y-1">
              {category.children.map((subcategory) => (
                <div
                  key={subcategory.name}
                  onMouseEnter={() => setSelectedSubcategory(subcategory.name)}
                  className="group"
                >
                  <Link
                    href={subcategory.href}
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600"
                  >
                    <span>{subcategory.name}</span>
                    {subcategory.children && subcategory.children.length > 0 && (
                      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </Link>
                  
                  {/* Third level */}
                  {subcategory.children && selectedSubcategory === subcategory.name && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4"
                    >
                      {subcategory.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-600"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column - Image Preview */}
            <div className="relative h-64 overflow-hidden rounded-lg bg-gray-100">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  {category.name}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

