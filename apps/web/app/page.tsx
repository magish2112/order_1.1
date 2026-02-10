import { Hero } from '@/components/sections/hero'
import { Advantages } from '@/components/sections/advantages'
import { Portfolio } from '@/components/sections/portfolio'
import { WorkSteps } from '@/components/sections/work-steps'
import { Reviews } from '@/components/sections/reviews'
import { Articles } from '@/components/sections/articles'
import { Calculator } from '@/components/sections/calculator'
import { FaqSection } from '@/components/sections/faq'
import { Cta } from '@/components/sections/cta'

export default function HomePage() {
  return (
    <>
      <Hero />
      <WorkSteps />
      <Advantages />
      <Portfolio />
      <Reviews />
      <Articles />
      <Calculator />
      <FaqSection />
      <Cta />
    </>
  )
}

