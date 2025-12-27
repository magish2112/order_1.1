'use client'

import { AnimatedButton } from './animated-button'

export default function AnimatedButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-lg">
      <AnimatedButton variant="default">
        Animation Button
      </AnimatedButton>
      <AnimatedButton variant="primary">
        Primary Button
      </AnimatedButton>
      <AnimatedButton variant="secondary">
        Secondary Button
      </AnimatedButton>
      <AnimatedButton variant="success">
        Success Button
      </AnimatedButton>
      <AnimatedButton variant="danger">
        Danger Button
      </AnimatedButton>
      <AnimatedButton href="/kontakty" variant="primary">
        Ссылка на контакты
      </AnimatedButton>
    </div>
  )
}

