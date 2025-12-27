'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1)
  const cols = new Array(100).fill(1)

  // Адаптированные цвета к цветовой схеме сайта (primary оттенки)
  const colors = useMemo(() => [
    'rgb(199 210 254)', // indigo-300 (primary-300)
    'rgb(165 180 252)', // indigo-400 (primary-400)
    'rgb(129 140 248)', // indigo-500 (primary-500)
    'rgb(99 102 241)',  // indigo-600 (primary-600)
    'rgb(196 181 253)', // violet-300 (дополнительный)
    'rgb(167 139 250)', // violet-400
    'rgb(147 197 253)', // blue-300 (дополнительный)
    'rgb(125 211 252)', // sky-300
    'rgb(216 180 254)', // purple-300
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

