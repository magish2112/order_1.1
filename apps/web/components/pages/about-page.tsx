'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { api, ApiResponse } from '@/lib/api'
import { Employee } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Users, TrendingUp, CheckCircle2, User } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const stats = [
  { label: 'Выполнено проектов', value: '500+', icon: CheckCircle2 },
  { label: 'Лет на рынке', value: '15+', icon: TrendingUp },
  { label: 'Сотрудников', value: '50+', icon: Users },
  { label: 'Довольных клиентов', value: '1000+', icon: Award },
]

export function AboutPage() {
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Employee[]>>('/employees?limit=100')
      return response.data
    },
  })

  // Fallback employees if API fails
  const fallbackEmployees = [
    { id: '1', firstName: 'Иван', lastName: 'Иванов', position: 'Главный прораб', bio: 'Опыт работы более 10 лет', photo: null },
    { id: '2', firstName: 'Мария', lastName: 'Петрова', position: 'Дизайнер интерьеров', bio: 'Специалист по современным решениям', photo: null },
  ]

  const displayEmployees = employees || (error ? fallbackEmployees : [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">О компании</h1>
          <p className="mt-4 text-xl text-gray-300">
            Профессиональный ремонт и дизайн интерьеров с 2008 года
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="mx-auto h-12 w-12 text-primary-600" />
                <div className="mt-4 text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">О компании Eterno Stroy</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">
              Клиенты выбирают Eterno Stroy за проверенное качество, скорость и клиентоориентированность в внутренней отделке квартир, домов и офисов, а также за предоставляемые цены ниже рыночных и гарантию на качество работ.
            </p>
            <h3 className="mt-8 text-2xl font-bold text-gray-900">Наша концепция</h3>
            <p className="text-gray-700 leading-relaxed">
              Наша концепция — доводить до ума каждый объект, уделяя ему большое внимание. Мы не распыляемся на большое количество объектов в погоне за объемами, а предпочитаем уделять внимание мелочам в каждом из наших проектов.
            </p>
            <p className="text-gray-700 mt-4 leading-relaxed font-semibold">
              Наш главный приоритет — довольство клиента и хорошая репутация!
            </p>
            <h3 className="mt-8 text-2xl font-bold text-gray-900">Наши преимущества</h3>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-start"><span className="mr-2 text-primary-600">✓</span> Проверенное качество работ</li>
              <li className="flex items-start"><span className="mr-2 text-primary-600">✓</span> Скорость выполнения работ</li>
              <li className="flex items-start"><span className="mr-2 text-primary-600">✓</span> Клиентоориентированность</li>
              <li className="flex items-start"><span className="mr-2 text-primary-600">✓</span> Цены ниже рыночных</li>
              <li className="flex items-start"><span className="mr-2 text-primary-600">✓</span> Гарантия на качество работ</li>
              <li className="flex items-start"><span className="mr-2 text-primary-600">✓</span> Индивидуальный подход к каждому проекту</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team */}
      {employees && employees.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Наша команда
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Профессионалы с многолетним опытом работы
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {employees.slice(0, 8).map((employee) => (
                <Card key={employee.id} className="text-center">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      {employee.photo && getImageUrl(employee.photo) ? (
                        <div className="relative h-32 w-32 overflow-hidden rounded-full">
                          <Image
                            src={getImageUrl(employee.photo)!}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="mt-1 text-primary-600">{employee.position}</p>
                    {employee.department && (
                      <p className="mt-1 text-sm text-gray-500">{employee.department}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

