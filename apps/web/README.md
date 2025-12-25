# Публичный сайт ремонтно-строительной компании

Frontend приложение на Next.js 14 с App Router для сайта ремонтно-строительной компании.

## Технологии

- **Next.js 14** - React фреймворк с SSR/SSG
- **TypeScript** - Типизация
- **Tailwind CSS** - Утилитарный CSS
- **Framer Motion** - Анимации
- **TanStack Query** - Работа с API
- **React Hook Form + Zod** - Формы и валидация
- **Lucide React** - Иконки

## Структура проекта

```
apps/web/
├── app/                    # App Router (страницы и layouts)
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Главная страница
│   └── globals.css        # Глобальные стили
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── layout/           # Layout компоненты (Header, Footer)
│   └── sections/         # Секции главной страницы
├── lib/                  # Утилиты и конфигурация
│   ├── api.ts           # API клиент
│   ├── types.ts         # TypeScript типы
│   └── utils.ts         # Вспомогательные функции
└── public/              # Статические файлы
```

## Установка и запуск

### Установка зависимостей

```bash
npm install
# или
pnpm install
# или
yarn install
```

### Настройка переменных окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000
```

### Запуск в режиме разработки

```bash
npm run dev
# или
pnpm dev
# или
yarn dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

### Сборка для production

```bash
npm run build
npm start
```

### Линтинг

```bash
npm run lint
```

### Проверка типов

```bash
npm run typecheck
```

## Основные страницы

- `/` - Главная страница
- `/remont/*` - Каталог услуг по ремонту (с вложенными категориями)
- `/dizajn/*` - Услуги дизайна (с вложенными категориями)
- `/portfolio` - Портфолио проектов с фильтрами
- `/portfolio/[slug]` - Детальная страница проекта
- `/stati` - Блог со статьями и поиском
- `/stati/[slug]` - Детальная страница статьи
- `/o-kompanii` - О компании
- `/vakansii` - Вакансии
- `/kontakty` - Контакты с формой обратной связи
- `/kalkulyator` - Калькулятор стоимости ремонта

## API интеграция

Все запросы к API выполняются через клиент в `lib/api.ts`. Используется базовый URL из переменной окружения `NEXT_PUBLIC_API_URL`.

Пример использования:

```typescript
import { api } from '@/lib/api'
import { Service } from '@/lib/types'

const services = await api.get<Service[]>('/services')
```

## Компоненты

### UI компоненты

Базовые переиспользуемые компоненты находятся в `components/ui/`:
- `Button` - Кнопки
- `Input` - Поля ввода
- `Card` - Карточки

### Layout компоненты

- `Header` - Шапка сайта с навигацией
- `Footer` - Подвал сайта

### Секции главной страницы

- `Hero` - Главный баннер с формой заявки
- `Services` - Блок услуг
- `Advantages` - Преимущества
- `Portfolio` - Избранные проекты
- `WorkSteps` - Этапы работы
- `Team` - Команда
- `Reviews` - Отзывы
- `Articles` - Статьи
- `Calculator` - Калькулятор
- `Faq` - FAQ
- `Cta` - Призыв к действию

## SEO

- Динамические мета-теги через `generateMetadata` на всех страницах
- Structured Data (JSON-LD) для Organization, LocalBusiness, Service, Article, FAQPage, BreadcrumbList
- Динамический sitemap.xml
- robots.txt
- Оптимизация изображений через `next/image`
- SSR/SSG для лучшей индексации
- Open Graph теги

## Производительность

- Server Components по умолчанию
- Code splitting автоматически
- Оптимизация изображений
- Lazy loading компонентов
- Кеширование через TanStack Query

## Дополнительные ресурсы

- [Документация Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

