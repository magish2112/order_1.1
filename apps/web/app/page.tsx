import { Hero } from '@/components/sections/hero'
import { Services } from '@/components/sections/services'
import { Advantages } from '@/components/sections/advantages'
import { Portfolio } from '@/components/sections/portfolio'
import { WorkSteps } from '@/components/sections/work-steps'
import { Team } from '@/components/sections/team'
import { Reviews } from '@/components/sections/reviews'
import { Articles } from '@/components/sections/articles'
import { Calculator } from '@/components/sections/calculator'
import { FaqSection } from '@/components/sections/faq'
import { Cta } from '@/components/sections/cta'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Advantages />
      <Portfolio />
      <WorkSteps />
      <Team />
      <Reviews />
      <Articles />
      <Calculator />
      <FaqSection />
      <Cta />
    </>
  )
}

