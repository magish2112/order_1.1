'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Vacancy } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Briefcase, DollarSign, Clock, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export function VacanciesPage() {
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null)

  const { data: vacancies, isLoading } = useQuery({
    queryKey: ['vacancies'],
    queryFn: () => api.get<Vacancy[]>('/vacancies?isActive=true'),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Briefcase className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Вакансии
          </h1>
          <p className="mt-4 text-xl text-primary-100">
            Присоединяйтесь к команде профессионалов
          </p>
        </div>
      </section>

      {/* Vacancies */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!vacancies || vacancies.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600">На данный момент нет открытых вакансий</p>
              <p className="mt-2 text-sm text-gray-500">
                Но мы всегда рады инициативным специалистам. Присылайте резюме на{' '}
                <a href="mailto:hr@remstroy.ru" className="text-primary-600 hover:underline">
                  hr@remstroy.ru
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {vacancies.map((vacancy) => (
                <Card
                  key={vacancy.id}
                  className="transition-all hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{vacancy.title}</CardTitle>
                        {vacancy.department && (
                          <p className="mt-1 text-primary-600">{vacancy.department}</p>
                        )}
                      </div>
                      {(vacancy.salaryFrom || vacancy.salaryTo) && (
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary-600">
                            {vacancy.salaryFrom && formatPrice(vacancy.salaryFrom)}
                            {vacancy.salaryFrom && vacancy.salaryTo && ' - '}
                            {vacancy.salaryTo && formatPrice(vacancy.salaryTo)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                      {vacancy.experience && (
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          {vacancy.experience}
                        </div>
                      )}
                      {vacancy.employment && (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {vacancy.employment}
                        </div>
                      )}
                    </div>

                    <div className="prose max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: vacancy.description }}
                        className="line-clamp-3"
                      />
                    </div>

                    {vacancy.requirements && vacancy.requirements.length > 0 && (
                      <div className="mt-4">
                        <h4 className="mb-2 font-semibold text-gray-900">Требования:</h4>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {vacancy.requirements.slice(0, 3).map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      className="mt-6"
                      onClick={() =>
                        setSelectedVacancy(selectedVacancy === vacancy.id ? null : vacancy.id)
                      }
                    >
                      {selectedVacancy === vacancy.id ? 'Скрыть детали' : 'Подробнее'}
                    </Button>

                    {selectedVacancy === vacancy.id && (
                      <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                        {vacancy.requirements && vacancy.requirements.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">Требования:</h4>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                              {vacancy.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">Обязанности:</h4>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                              {vacancy.responsibilities.map((resp, index) => (
                                <li key={index}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {vacancy.conditions && vacancy.conditions.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-semibold text-gray-900">Условия:</h4>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                              {vacancy.conditions.map((cond, index) => (
                                <li key={index}>{cond}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button className="w-full" asChild>
                          <a href={`mailto:hr@remstroy.ru?subject=Отклик на вакансию: ${vacancy.title}`}>
                            Откликнуться на вакансию
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

