'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, HardHat, Building2, Ruler, Shield } from 'lucide-react'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  primaryButtonText?: string
  secondaryButtonText?: string
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Строим будущее",
  subtitle = "с надежностью и качеством",
  description = "Профессиональное строительство промышленных и коммерческих объектов. Более 15 лет опыта в реализации сложных проектов.",
  primaryButtonText = "Начать проект",
  secondaryButtonText = "Наши работы"
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    { icon: HardHat, text: "Безопасность" },
    { icon: Building2, text: "Качество" },
    { icon: Ruler, text: "Точность" },
    { icon: Shield, text: "Гарантия" }
  ]

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen bg-background overflow-hidden flex items-center"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-accent/20 to-transparent blur-3xl" />

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent font-medium">Лидер строительной индустрии</span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                {title}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/80">
                  {subtitle}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                {description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground group"
                asChild
              >
                <Link href="/kalkulyator">
                  {primaryButtonText}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group"
                asChild
              >
                <Link href="/portfolio">{secondaryButtonText}</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 border border-border backdrop-blur-sm hover:border-accent/50 transition-colors"
                >
                  <feature.icon className="h-6 w-6 text-accent" />
                  <span className="text-sm text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Industrial Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[600px]">
              {/* Main Construction Frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Crane Structure */}
                  <div className="absolute top-0 right-1/4 w-2 h-64 bg-gradient-to-b from-accent to-accent/80 transform -rotate-12 origin-bottom">
                    <div className="absolute -top-2 -right-20 w-24 h-2 bg-accent" />
                    <div className="absolute -top-2 -right-20 w-2 h-16 bg-accent/80" />
                  </div>

                  {/* Building Outline */}
                  <div className="absolute bottom-0 left-1/4 w-48 h-80 border-4 border-border bg-card/30 backdrop-blur-sm">
                    {/* Windows Grid */}
                    <div className="grid grid-cols-3 gap-4 p-4 h-full">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-accent/20 border border-accent/30"
                          style={{
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Geometric Shapes */}
                  <div className="absolute top-20 left-10 w-32 h-32 border-2 border-accent/30 rotate-45 animate-pulse" />
                  <div className="absolute bottom-40 right-10 w-24 h-24 border-2 border-accent/30 rotate-12" />

                  {/* Measurement Lines */}
                  <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                  <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-accent/50 to-transparent" />

                  {/* Floating Stats */}
                  <div className="absolute top-10 right-10 px-4 py-3 bg-card/80 border border-accent/30 backdrop-blur-sm rounded-lg">
                    <div className="text-2xl font-bold text-accent">500+</div>
                    <div className="text-xs text-muted-foreground">Проектов</div>
                  </div>

                  <div className="absolute bottom-20 left-10 px-4 py-3 bg-card/80 border border-accent/30 backdrop-blur-sm rounded-lg">
                    <div className="text-2xl font-bold text-accent">15+</div>
                    <div className="text-xs text-muted-foreground">Лет опыта</div>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

export function Hero() {
  return (
    <HeroSection
      title="Строим будущее"
      subtitle="с надежностью и качеством"
      description="Профессиональное строительство промышленных и коммерческих объектов. Более 15 лет опыта в реализации сложных проектов."
      primaryButtonText="Рассчитать стоимость"
      secondaryButtonText="Смотреть портфолио"
    />
  )
}
