'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1)
  const cols = new Array(100).fill(1)

  // Адаптированные цвета к новой цветовой схеме сайта
  const colors = useMemo(() => [
    'rgba(225, 184, 105, 0.1)',  // Золотой, очень прозрачный
    'rgba(225, 184, 105, 0.15)', // Золотой, прозрачный
    'rgba(23, 39, 28, 0.05)',    // Тёмно-зелёный, очень прозрачный
    'rgba(23, 39, 28, 0.08)',    // Тёмно-зелёный, прозрачный
    'rgba(225, 184, 105, 0.2)',  // Золотой, полупрозрачный
  ], [])

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        'absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0',
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          className="w-16 h-8 border-l border-slate-700/30 relative"
        >
          {cols.map((_, j) => {
            // Генерируем стабильные случайные значения на основе индексов
            const seed = i * 1000 + j
            const randomColor = colors[seed % colors.length]
            const randomDelay = (seed % 50) / 10
            const randomDuration = 3 + (seed % 30) / 10
            const shouldAnimate = (seed % 10) < 3 // 30% элементов анимируются
            
            return (
              <motion.div
                key={`col` + j}
                initial={{ backgroundColor: 'transparent' }}
                animate={
                  shouldAnimate
                    ? {
                        backgroundColor: [
                          'transparent',
                          randomColor,
                          'transparent',
                        ],
                      }
                    : { backgroundColor: 'transparent' }
                }
                transition={
                  shouldAnimate
                    ? {
                        duration: randomDuration,
                        delay: randomDelay,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }
                    : {}
                }
                whileHover={{
                  backgroundColor: randomColor,
                  transition: { duration: 0 },
                }}
                className="w-16 h-8 border-r border-t border-slate-700/30 relative"
              >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-600/40 stroke-[1px] pointer-events-none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
              </motion.div>
            )
          })}
        </motion.div>
      ))}
    </div>
  )
}

export const Boxes = React.memo(BoxesCore)

