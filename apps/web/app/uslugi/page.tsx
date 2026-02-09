import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Wrench, Palette, Package, Sofa } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Услуги | Ремонт, Дизайн, Комплектация, Мебель',
  description: 'Полный спектр услуг: ремонт квартир и домов, дизайн интерьера, комплектация объектов, изготовление мебели на заказ.',
  openGraph: {
    title: 'Наши услуги | РемСтрой',
    description: 'Ремонт, дизайн, комплектация, мебель - полный спектр услуг',
  },
}

const services = [
  {
    title: 'Ремонт',
    description: 'Комплексный ремонт квартир, домов, офисов. Капитальный, косметический, дизайнерский ремонт.',
    href: '/uslugi/remont',
    icon: Wrench,
    color: 'from-orange-500 to-red-500'
  },
  {
    title: 'Дизайн',
    description: 'Профессиональный дизайн интерьера. Разработка дизайн-проектов, 3D визуализация.',
    href: '/uslugi/dizajn',
    icon: Palette,
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Комплектация',
    description: 'Полная комплектация объектов материалами и оборудованием. Поставка инженерных систем.',
    href: '/uslugi/komplektaciya',
    icon: Package,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Мебель',
    description: 'Изготовление и установка мебели на заказ. Корпусная мебель, встроенная мебель.',
    href: '/uslugi/mebel',
    icon: Sofa,
    color: 'from-green-500 to-emerald-500'
  }
]

export default function UslugiPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Наши услуги
          </h1>
          <p className="mt-4 text-xl text-primary-100">
            Полный спектр услуг от ремонта до изготовления мебели
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card key={service.title} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <Button asChild className="group/btn">
                      <Link href={service.href}>
                        Подробнее
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Готовы начать проект?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Свяжитесь с нами для консультации и бесплатного замера
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/kontakty">
                Связаться с нами
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/kalkulyator">
                Рассчитать стоимость
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
