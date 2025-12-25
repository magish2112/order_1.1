# Техническое задание на разработку сайта ремонтно-строительной компании

## Аналог: magass.ru

---

## 1. Общее описание проекта

### 1.1 Тип проекта
Корпоративный сайт ремонтно-строительной компании с расширенным функционалом:
- Каталог услуг с многоуровневой иерархией
- Портфолио выполненных проектов
- Блог/статьи
- Калькулятор стоимости ремонта
- Формы обратной связи
- Административная панель для управления контентом

### 1.2 Целевая аудитория
- Владельцы квартир в новостройках и вторичном жилье
- Владельцы частных домов, коттеджей, таунхаусов
- Владельцы коммерческих помещений (офисы, рестораны, магазины)

---

## 2. Технологический стек

### 2.1 Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Next.js** | 14.x | React-фреймворк с SSR/SSG для SEO-оптимизации |
| **TypeScript** | 5.x | Типизация для надёжности кода |
| **Tailwind CSS** | 3.x | Утилитарный CSS-фреймворк |
| **Framer Motion** | 11.x | Анимации и переходы |
| **Swiper** | 11.x | Слайдеры/карусели для галерей и отзывов |
| **React Hook Form** | 7.x | Управление формами |
| **Zod** | 3.x | Валидация схем данных |
| **Zustand** | 4.x | Управление глобальным состоянием |
| **TanStack Query** | 5.x | Кеширование и синхронизация данных с сервером |
| **Lucide React** | последняя | Иконки |
| **next-intl** | 3.x | Интернационализация (опционально) |

### 2.2 Backend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Node.js** | 20.x LTS | Среда выполнения |
| **Fastify** | 4.x | Высокопроизводительный веб-фреймворк |
| **TypeScript** | 5.x | Типизация |
| **Prisma** | 5.x | ORM для работы с базой данных |
| **PostgreSQL** | 16.x | Основная база данных |
| **Redis** | 7.x | Кеширование и сессии |
| **Zod** | 3.x | Валидация данных |
| **Nodemailer** | 6.x | Отправка email |
| **Sharp** | 0.33.x | Обработка изображений |
| **Multer / @fastify/multipart** | последняя | Загрузка файлов |
| **JWT / Passport** | последняя | Аутентификация |

### 2.3 Административная панель

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 18.x | UI библиотека |
| **Vite** | 5.x | Сборщик |
| **Ant Design** или **Shadcn/UI** | последняя | UI компоненты |
| **TanStack Table** | 8.x | Таблицы с сортировкой/фильтрацией |
| **React Router** | 6.x | Маршрутизация |
| **TinyMCE** или **Tiptap** | последняя | WYSIWYG редактор |

### 2.4 Инфраструктура и DevOps

| Технология | Назначение |
|------------|------------|
| **Docker** + **Docker Compose** | Контейнеризация |
| **Nginx** | Обратный прокси, SSL |
| **GitHub Actions** / **GitLab CI** | CI/CD |
| **MinIO** / **S3** | Хранение медиафайлов |
| **Prometheus** + **Grafana** | Мониторинг |

---

## 3. Архитектура системы

```
┌─────────────────────────────────────────────────────────────────────┐
│                              КЛИЕНТ                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────────┐     │
│  │   Публичный сайт    │    │    Панель администратора        │     │
│  │   (Next.js SSR)     │    │    (React SPA)                  │     │
│  │   Port: 3000        │    │    Port: 3001                   │     │
│  └──────────┬──────────┘    └───────────────┬─────────────────┘     │
└─────────────┼───────────────────────────────┼───────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                        │
│                         SSL Termination                              │
│                         Port: 80/443                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API СЕРВЕР                                 │
│                        (Fastify + Node.js)                          │
│                           Port: 4000                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌────────────┐  ┌──────────────┐  ┌─────────────┐   │
│  │  Routes   │  │ Controllers│  │   Services   │  │ Middlewares │   │
│  └───────────┘  └────────────┘  └──────────────┘  └─────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Prisma ORM                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    PostgreSQL    │  │      Redis       │  │   MinIO / S3     │
│   Port: 5432     │  │   Port: 6379     │  │   Port: 9000     │
│   (Основная БД)  │  │ (Кеш + Сессии)   │  │ (Медиафайлы)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 4. Структура базы данных (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          UserRole  @default(MANAGER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Связи
  createdProjects   Project[]    @relation("CreatedBy")
  createdArticles   Article[]    @relation("ArticleAuthor")
  handledRequests   Request[]    @relation("HandledBy")
  
  @@map("users")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
  EDITOR
}

// ==================== КАТЕГОРИИ УСЛУГ ====================

model ServiceCategory {
  id              String            @id @default(cuid())
  slug            String            @unique
  name            String
  description     String?           @db.Text
  shortDescription String?
  image           String?
  icon            String?
  parentId        String?
  order           Int               @default(0)
  isActive        Boolean           @default(true)
  
  // SEO
  metaTitle       String?
  metaDescription String?           @db.Text
  metaKeywords    String?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  // Связи
  parent          ServiceCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children        ServiceCategory[] @relation("CategoryHierarchy")
  services        Service[]
  projects        Project[]
  
  @@map("service_categories")
}

// ==================== УСЛУГИ ====================

model Service {
  id              String          @id @default(cuid())
  slug            String          @unique
  name            String
  description     String?         @db.Text
  content         String?         @db.Text
  shortDescription String?
  
  // Цены
  priceFrom       Decimal?        @db.Decimal(10, 2)
  priceTo         Decimal?        @db.Decimal(10, 2)
  priceUnit       String?         // "за м²", "за проект" и т.д.
  
  // Медиа
  image           String?
  gallery         String[]        // массив URL изображений
  
  // Параметры
  duration        String?         // "от 30 дней"
  features        Json?           // дополнительные характеристики
  
  categoryId      String
  order           Int             @default(0)
  isActive        Boolean         @default(true)
  isFeatured      Boolean         @default(false)
  
  // SEO
  metaTitle       String?
  metaDescription String?         @db.Text
  metaKeywords    String?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Связи
  category        ServiceCategory @relation(fields: [categoryId], references: [id])
  projects        Project[]
  pricingItems    PricingItem[]
  
  @@map("services")
}

// ==================== ПРАЙС-ЛИСТ ====================

model PricingItem {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  unit        String   // "м²", "шт", "п.м" и т.д.
  serviceId   String?
  category    String?  // категория работ
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  service     Service? @relation(fields: [serviceId], references: [id])
  
  @@map("pricing_items")
}

// ==================== ПРОЕКТЫ (ПОРТФОЛИО) ====================

model Project {
  id              String          @id @default(cuid())
  slug            String          @unique
  title           String
  description     String?         @db.Text
  content         String?         @db.Text
  
  // Характеристики проекта
  area            Decimal?        @db.Decimal(10, 2) // площадь в м²
  rooms           Int?            // количество комнат
  duration        Int?            // срок выполнения в днях
  price           Decimal?        @db.Decimal(12, 2) // стоимость проекта
  location        String?         // ЖК, адрес
  completedAt     DateTime?       // дата завершения
  
  // Стиль и тип
  style           String?         // "современный", "лофт", "классика"
  propertyType    String?         // "квартира", "дом", "офис"
  repairType      String?         // "дизайнерский", "капитальный", "косметический"
  
  // Медиа
  coverImage      String?
  beforeImages    String[]        // фото до ремонта
  afterImages     String[]        // фото после ремонта
  designImages    String[]        // 3D визуализации дизайн-проекта
  videoUrl        String?
  
  // Отзыв клиента
  clientName      String?
  clientReview    String?         @db.Text
  clientPhoto     String?
  
  categoryId      String?
  serviceIds      String[]
  
  order           Int             @default(0)
  isActive        Boolean         @default(true)
  isFeatured      Boolean         @default(false)
  viewsCount      Int             @default(0)
  
  // SEO
  metaTitle       String?
  metaDescription String?         @db.Text
  
  createdById     String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Связи
  category        ServiceCategory? @relation(fields: [categoryId], references: [id])
  createdBy       User?            @relation("CreatedBy", fields: [createdById], references: [id])
  services        Service[]
  tags            ProjectTag[]
  
  @@map("projects")
}

model ProjectTag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  projects  Project[]
  
  @@map("project_tags")
}

// ==================== СТАТЬИ (БЛОГ) ====================

model Article {
  id              String        @id @default(cuid())
  slug            String        @unique
  title           String
  excerpt         String?       @db.Text
  content         String        @db.Text
  coverImage      String?
  
  readingTime     Int?          // время чтения в минутах
  
  authorId        String?
  categoryId      String?
  
  isPublished     Boolean       @default(false)
  publishedAt     DateTime?
  viewsCount      Int           @default(0)
  
  // SEO
  metaTitle       String?
  metaDescription String?       @db.Text
  metaKeywords    String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Связи
  author          User?         @relation("ArticleAuthor", fields: [authorId], references: [id])
  category        ArticleCategory? @relation(fields: [categoryId], references: [id])
  tags            ArticleTag[]
  
  @@map("articles")
}

model ArticleCategory {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        String
  description String?
  order       Int       @default(0)
  
  articles    Article[]
  
  @@map("article_categories")
}

model ArticleTag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  articles  Article[]
  
  @@map("article_tags")
}

// ==================== СОТРУДНИКИ ====================

model Employee {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  position    String
  department  String?  // "Дизайнеры", "Прорабы"
  photo       String?
  bio         String?  @db.Text
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("employees")
}

// ==================== ОТЗЫВЫ ====================

model Review {
  id          String      @id @default(cuid())
  authorName  String
  authorPhoto String?
  content     String      @db.Text
  rating      Int         @default(5) // от 1 до 5
  projectId   String?
  source      String?     // "yandex", "google", "internal"
  sourceUrl   String?
  isApproved  Boolean     @default(false)
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@map("reviews")
}

// ==================== ЗАЯВКИ ====================

model Request {
  id            String        @id @default(cuid())
  
  // Контактные данные
  name          String
  phone         String
  email         String?
  
  // Предпочтения связи
  contactMethod String?       // "phone", "telegram", "whatsapp"
  callbackDate  DateTime?     // желаемая дата звонка
  
  // Информация о проекте
  message       String?       @db.Text
  serviceType   String?
  area          Decimal?      @db.Decimal(10, 2)
  budget        String?
  
  // Источник
  source        String?       // "calculator", "callback", "consultation"
  pageUrl       String?       // страница, с которой отправлена заявка
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  
  // Обработка
  status        RequestStatus @default(NEW)
  handledById   String?
  handledAt     DateTime?
  notes         String?       @db.Text
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Связи
  handledBy     User?         @relation("HandledBy", fields: [handledById], references: [id])
  
  @@map("requests")
}

enum RequestStatus {
  NEW
  IN_PROGRESS
  CONTACTED
  CONVERTED
  REJECTED
  SPAM
}

// ==================== КАЛЬКУЛЯТОР ====================

model CalculatorConfig {
  id                String   @id @default(cuid())
  name              String
  
  // Базовые цены за м²
  basePriceCosmetic Decimal  @db.Decimal(10, 2) // косметический
  basePriceCapital  Decimal  @db.Decimal(10, 2) // капитальный
  basePriceDesign   Decimal  @db.Decimal(10, 2) // дизайнерский
  basePriceElite    Decimal  @db.Decimal(10, 2) // элитный
  
  // Коэффициенты
  coefficients      Json     // {"newBuilding": 0.9, "secondary": 1.0, ...}
  
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("calculator_configs")
}

// ==================== ВАКАНСИИ ====================

model Vacancy {
  id              String   @id @default(cuid())
  title           String
  department      String?
  description     String   @db.Text
  requirements    String[] // массив требований
  responsibilities String[] // массив обязанностей
  conditions      String[] // условия работы
  salaryFrom      Decimal? @db.Decimal(10, 2)
  salaryTo        Decimal? @db.Decimal(10, 2)
  experience      String?  // "1-3 года", "без опыта"
  employment      String?  // "полная занятость", "частичная"
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("vacancies")
}

// ==================== FAQ ====================

model Faq {
  id        String   @id @default(cuid())
  question  String
  answer    String   @db.Text
  category  String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("faqs")
}

// ==================== НАСТРОЙКИ САЙТА ====================

model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  type      String   @default("string") // "string", "number", "json", "boolean"
  group     String?  // "contacts", "social", "seo"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("settings")
}

// ==================== МЕДИАФАЙЛЫ ====================

model Media {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  mimeType    String
  size        Int
  url         String
  thumbnailUrl String?
  alt         String?
  folder      String?
  
  createdAt   DateTime @default(now())
  
  @@map("media")
}
```

---

## 5. Структура проекта

### 5.1 Монорепозиторий (рекомендуемая структура)

```
project-root/
├── apps/
│   ├── web/                      # Публичный сайт (Next.js)
│   │   ├── app/                  # App Router
│   │   │   ├── (public)/         # Публичные страницы
│   │   │   │   ├── page.tsx      # Главная
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── remont/       # Услуги ремонта
│   │   │   │   ├── dizajn/       # Услуги дизайна
│   │   │   │   ├── portfolio/    # Портфолио
│   │   │   │   ├── stati/        # Блог
│   │   │   │   ├── o-kompanii/   # О компании
│   │   │   │   ├── vakansii/     # Вакансии
│   │   │   │   ├── kontakty/     # Контакты
│   │   │   │   └── kalkulyator/  # Калькулятор
│   │   │   ├── api/              # API routes (при необходимости)
│   │   │   └── sitemap.ts        # Динамическая sitemap
│   │   ├── components/
│   │   │   ├── ui/               # Базовые UI компоненты
│   │   │   ├── layout/           # Header, Footer, Navigation
│   │   │   ├── sections/         # Секции страниц
│   │   │   ├── forms/            # Формы
│   │   │   └── shared/           # Общие компоненты
│   │   ├── lib/                  # Утилиты, API клиент
│   │   ├── hooks/                # Кастомные хуки
│   │   ├── styles/               # Глобальные стили
│   │   ├── public/               # Статические файлы
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── admin/                    # Панель администратора (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Services/
│   │   │   │   ├── Projects/
│   │   │   │   ├── Articles/
│   │   │   │   ├── Requests/
│   │   │   │   ├── Employees/
│   │   │   │   ├── Reviews/
│   │   │   │   ├── Vacancies/
│   │   │   │   ├── Settings/
│   │   │   │   └── Users/
│   │   │   ├── components/
│   │   │   ├── layouts/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── utils/
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                      # Backend API (Fastify)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   └── auth.schema.ts
│       │   │   ├── services/
│       │   │   ├── projects/
│       │   │   ├── articles/
│       │   │   ├── requests/
│       │   │   ├── employees/
│       │   │   ├── reviews/
│       │   │   ├── vacancies/
│       │   │   ├── calculator/
│       │   │   ├── media/
│       │   │   └── settings/
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── validation.middleware.ts
│       │   │   └── error.middleware.ts
│       │   ├── plugins/
│       │   ├── utils/
│       │   ├── config/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── package.json
│
├── packages/
│   ├── shared/                   # Общие типы и утилиты
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   ├── utils/
│   │   │   └── validators/
│   │   └── package.json
│   │
│   └── ui/                       # Переиспользуемые UI компоненты
│       ├── src/
│       └── package.json
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.admin
│   ├── Dockerfile.api
│   └── nginx/
│       └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── turbo.json                    # Turborepo конфигурация
├── pnpm-workspace.yaml
└── package.json
```

---

## 6. Описание страниц и функционала

### 6.1 Публичный сайт

#### 6.1.1 Главная страница (`/`)
**Секции:**
1. **Hero** — полноэкранный баннер с слоганом, формой заявки
2. **Услуги** — карточки основных услуг (Ремонт, Дизайн, Прочие услуги)
3. **Преимущества** — почему выбирают компанию (цифры, факты)
4. **Портфолио** — слайдер с избранными проектами
5. **Этапы работы** — визуальная схема процесса
6. **Команда** — горизонтальный слайдер сотрудников
7. **Отзывы** — карусель видеоотзывов
8. **Статьи** — последние публикации из блога
9. **Калькулятор** — встроенный виджет расчёта
10. **FAQ** — аккордеон с ответами
11. **CTA** — призыв к действию с формой
12. **Footer** — контакты, навигация, соцсети

#### 6.1.2 Каталог услуг (`/remont/`, `/dizajn/`, и подстраницы)
**Структура меню:**
```
Ремонт
├── Ремонт квартир
│   ├── Студии
│   │   ├── Ремонт студии
│   │   ├── Черновой ремонт
│   │   ├── Капитальный ремонт
│   │   ├── Евро-ремонт
│   │   └── Дизайнерский ремонт
│   ├── 1-к квартиры
│   ├── 2-к квартиры
│   ├── 3-к квартиры
│   ├── 4-к квартиры
│   └── 5-к квартиры
├── Новостройки
│   ├── 1-к квартиры
│   ├── 2-к квартиры
│   └── ...
├── Вторичные
│   ├── Ремонт хрущёвки
│   ├── Ремонт в сталинке
│   └── ...
├── Виды ремонта
│   ├── Элитный
│   ├── Дизайнерский
│   ├── Премиальный
│   ├── Евроремонт
│   ├── Капитальный
│   └── Комплексный
└── Стили ремонта
    ├── Современный
    ├── Минимализм
    ├── Лофт
    ├── Классика
    ├── Неоклассика
    ├── Скандинавский
    └── ...

Дизайн
├── Дизайн-проект интерьера
│   ├── Студий
│   ├── 1-к квартир
│   └── ...
└── Стили дизайна интерьера

Прочие услуги
├── Дома
│   ├── Таунхаусы
│   ├── Дачные дома
│   ├── Дуплексы
│   └── Коттеджи
├── Апартаменты (Москва Сити)
├── Пентхаусы
├── Офисы
├── Рестораны
├── Салоны красоты
└── Фитнес-центры
```

**Страница категории услуги:**
- Hero с названием и описанием
- Подкатегории (если есть)
- Описание услуги
- Преимущества
- Портфолио по категории
- Прайс-лист
- Этапы работы
- Форма заявки
- FAQ

**Страница услуги:**
- Полное описание
- Галерея работ
- Цены
- Сроки выполнения
- Связанные проекты
- CTA форма

#### 6.1.3 Портфолио (`/portfolio/`)
**Функционал:**
- Фильтрация по:
  - Типу помещения (квартира, дом, офис)
  - Количеству комнат
  - Стилю
  - Площади
  - Виду ремонта
- Сортировка по дате, популярности
- Бесконечная подгрузка / пагинация
- Карточки проектов с превью

**Страница проекта (`/portfolio/[slug]/`):**
- Галерея "до/после" с слайдером сравнения
- 3D визуализации дизайн-проекта
- Характеристики (площадь, сроки, стоимость, ЖК)
- Описание проекта
- Отзыв клиента (текст + видео)
- Связанные проекты

#### 6.1.4 Блог (`/stati/`)
**Функционал:**
- Фильтрация по категориям
- Поиск по статьям
- Пагинация
- Время чтения

**Страница статьи (`/stati/[slug]/`):**
- Дата публикации
- Время чтения
- Содержание (оглавление)
- Контент с медиа
- Автор
- Теги
- Связанные статьи
- Форма подписки / заявки

#### 6.1.5 О компании (`/o-kompanii/`)
- История компании
- Миссия и ценности
- Цифры и достижения
- Команда (слайдер сотрудников)
- Сертификаты и награды
- Партнёры

#### 6.1.6 Вакансии (`/vakansii/`)
- Список открытых вакансий
- Фильтрация по отделам
- Страница вакансии с формой отклика

#### 6.1.7 Контакты (`/kontakty/`)
- Адрес офиса
- Карта (Яндекс.Карты / Google Maps)
- Телефоны
- Email
- Мессенджеры
- Время работы
- Форма обратной связи

#### 6.1.8 Калькулятор (`/kalkulyator/`)
**Поля:**
1. Тип помещения (квартира, дом, офис)
2. Тип жилья (новостройка, вторичка)
3. Количество комнат
4. Площадь (м²)
5. Тип ремонта (косметический, капитальный, дизайнерский, элитный)
6. Дополнительные услуги (чек-боксы)
7. Контактные данные

**Результат:**
- Приблизительная стоимость
- Сроки выполнения
- Предложение получить точный расчёт

---

### 6.2 Панель администратора

#### 6.2.1 Dashboard
- Статистика заявок (новые, в работе, конверсия)
- График заявок по дням/месяцам
- Последние заявки
- Популярные страницы
- Быстрые действия

#### 6.2.2 Услуги
- Древовидный список категорий
- CRUD для категорий
- CRUD для услуг
- Drag-n-drop сортировка
- Массовые операции (активация/деактивация)

#### 6.2.3 Проекты (Портфолио)
- Таблица с фильтрами и поиском
- CRUD для проектов
- Загрузка множества изображений
- Редактор описания (WYSIWYG)
- Связывание с услугами и категориями

#### 6.2.4 Статьи
- Таблица статей
- CRUD с WYSIWYG редактором
- Управление категориями и тегами
- Планирование публикации
- Предпросмотр

#### 6.2.5 Заявки
- Таблица заявок с фильтрацией по статусу
- Детали заявки
- Смена статуса
- Назначение менеджера
- Добавление заметок
- Экспорт в Excel

#### 6.2.6 Сотрудники
- Список сотрудников
- CRUD
- Загрузка фото
- Группировка по отделам

#### 6.2.7 Отзывы
- Модерация отзывов
- Одобрение/отклонение
- Редактирование
- Связывание с проектами

#### 6.2.8 Вакансии
- CRUD вакансий
- Отклики на вакансии

#### 6.2.9 FAQ
- CRUD вопросов-ответов
- Категоризация
- Сортировка

#### 6.2.10 Калькулятор
- Настройка базовых цен
- Коэффициенты
- Дополнительные услуги

#### 6.2.11 Медиатека
- Загрузка файлов
- Организация по папкам
- Поиск
- Информация о файле

#### 6.2.12 Настройки
- Контактная информация
- Социальные сети
- SEO настройки по умолчанию
- Email шаблоны
- Интеграции (CRM, аналитика)

#### 6.2.13 Пользователи
- Управление пользователями админки
- Роли и права доступа
- История действий

---

## 7. API Endpoints

### 7.1 Публичный API

```
GET    /api/v1/services                    # Список услуг
GET    /api/v1/services/:slug              # Одна услуга
GET    /api/v1/categories                  # Категории услуг (дерево)
GET    /api/v1/categories/:slug            # Категория с услугами

GET    /api/v1/projects                    # Портфолио с фильтрами
GET    /api/v1/projects/:slug              # Один проект
GET    /api/v1/projects/featured           # Избранные проекты

GET    /api/v1/articles                    # Статьи с пагинацией
GET    /api/v1/articles/:slug              # Одна статья
GET    /api/v1/articles/categories         # Категории статей

GET    /api/v1/employees                   # Сотрудники
GET    /api/v1/reviews                     # Одобренные отзывы
GET    /api/v1/vacancies                   # Активные вакансии
GET    /api/v1/faqs                        # FAQ

GET    /api/v1/calculator/config           # Конфигурация калькулятора
POST   /api/v1/calculator/calculate        # Расчёт стоимости

POST   /api/v1/requests                    # Отправка заявки
POST   /api/v1/requests/callback           # Заказ звонка
POST   /api/v1/requests/vacancy            # Отклик на вакансию

GET    /api/v1/settings/public             # Публичные настройки (контакты и т.д.)
```

### 7.2 Административный API (требует аутентификации)

```
# Аутентификация
POST   /api/v1/admin/auth/login
POST   /api/v1/admin/auth/logout
POST   /api/v1/admin/auth/refresh
GET    /api/v1/admin/auth/me

# Услуги
GET    /api/v1/admin/services
POST   /api/v1/admin/services
GET    /api/v1/admin/services/:id
PUT    /api/v1/admin/services/:id
DELETE /api/v1/admin/services/:id
PATCH  /api/v1/admin/services/:id/order

# Категории
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PUT    /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id

# Проекты
GET    /api/v1/admin/projects
POST   /api/v1/admin/projects
PUT    /api/v1/admin/projects/:id
DELETE /api/v1/admin/projects/:id

# Статьи
GET    /api/v1/admin/articles
POST   /api/v1/admin/articles
PUT    /api/v1/admin/articles/:id
DELETE /api/v1/admin/articles/:id
PATCH  /api/v1/admin/articles/:id/publish

# Заявки
GET    /api/v1/admin/requests
GET    /api/v1/admin/requests/:id
PATCH  /api/v1/admin/requests/:id/status
PATCH  /api/v1/admin/requests/:id/assign
GET    /api/v1/admin/requests/export

# Сотрудники
CRUD   /api/v1/admin/employees

# Отзывы
CRUD   /api/v1/admin/reviews
PATCH  /api/v1/admin/reviews/:id/approve

# Вакансии
CRUD   /api/v1/admin/vacancies

# FAQ
CRUD   /api/v1/admin/faqs

# Калькулятор
GET    /api/v1/admin/calculator/config
PUT    /api/v1/admin/calculator/config

# Медиа
POST   /api/v1/admin/media/upload
GET    /api/v1/admin/media
DELETE /api/v1/admin/media/:id

# Настройки
GET    /api/v1/admin/settings
PUT    /api/v1/admin/settings

# Пользователи
CRUD   /api/v1/admin/users

# Статистика
GET    /api/v1/admin/stats/dashboard
GET    /api/v1/admin/stats/requests
GET    /api/v1/admin/stats/views
```

---

## 8. Интеграции

### 8.1 Обязательные
- **Email** — отправка уведомлений о заявках (Nodemailer + SMTP)
- **SMS/Telegram Bot** — мгновенные уведомления менеджерам
- **Яндекс.Метрика / Google Analytics** — аналитика
- **Яндекс.Карты** — карта на странице контактов

### 8.2 Опциональные
- **amoCRM / Битрикс24** — CRM интеграция
- **WhatsApp Business API** — чат-виджет
- **Roistat** — сквозная аналитика
- **Calltouch / Comagic** — коллтрекинг

---

## 9. SEO требования

### 9.1 Техническое SEO
- Серверный рендеринг (SSR/SSG)
- Динамическая sitemap.xml
- robots.txt
- Структурированные данные (Schema.org)
  - Organization
  - LocalBusiness
  - Service
  - Article
  - FAQPage
  - Review
  - BreadcrumbList
- Канонические URL
- Редиректы (301)
- Оптимизация изображений (WebP, lazy loading)
- Core Web Vitals оптимизация

### 9.2 Контентное SEO
- Уникальные мета-теги для каждой страницы
- H1-H6 иерархия
- Alt-тексты для изображений
- Хлебные крошки
- Перелинковка

---

## 10. Безопасность

- HTTPS обязателен
- CORS настройка
- Rate limiting для API
- Защита от CSRF
- Валидация всех входящих данных (Zod)
- Санитизация HTML контента
- Безопасное хранение паролей (bcrypt)
- JWT с refresh tokens
- Логирование действий

---

## 11. Производительность

- HTTP/2
- Gzip/Brotli сжатие
- Кеширование (Redis, CDN)
- Оптимизация изображений
- Code splitting
- Lazy loading компонентов
- Prefetching ссылок
- Service Worker (PWA опционально)

---

## 12. Техническое задание для агента генерации

### 12.1 Задание для Backend-агента

```
ЗАДАНИЕ: Разработка Backend API для сайта ремонтно-строительной компании

ТЕХНОЛОГИЧЕСКИЙ СТЕК:
- Node.js 20.x
- Fastify 4.x
- TypeScript 5.x
- Prisma 5.x + PostgreSQL 16
- Redis 7.x
- Zod для валидации
- JWT аутентификация

ТРЕБОВАНИЯ:

1. СТРУКТУРА ПРОЕКТА:
   - Модульная архитектура (каждая сущность в отдельном модуле)
   - Разделение на routes, controllers, services, schemas
   - Middleware для аутентификации, валидации, обработки ошибок
   - Конфигурация через переменные окружения

2. БАЗА ДАННЫХ:
   - Использовать предоставленную Prisma схему
   - Реализовать seed скрипт с тестовыми данными
   - Миграции для всех изменений

3. API ENDPOINTS:
   - Публичный API для фронтенда (получение данных)
   - Административный API (CRUD, требует аутентификации)
   - Все эндпоинты из раздела 7 спецификации

4. АУТЕНТИФИКАЦИЯ:
   - JWT с access/refresh токенами
   - Роли: SUPER_ADMIN, ADMIN, MANAGER, EDITOR
   - Проверка прав доступа для каждого эндпоинта

5. ФУНКЦИОНАЛ:
   - Категории услуг с иерархией (дерево)
   - CRUD для всех сущностей
   - Фильтрация и пагинация списков
   - Загрузка и обработка изображений (Sharp)
   - Калькулятор расчёта стоимости
   - Обработка и хранение заявок
   - Отправка email уведомлений

6. ВАЛИДАЦИЯ:
   - Zod схемы для всех входящих данных
   - Детальные сообщения об ошибках

7. КЕШИРОВАНИЕ:
   - Redis для кеширования публичных данных
   - Инвалидация кеша при изменениях

8. ЛОГИРОВАНИЕ:
   - Pino для структурированных логов
   - Логирование всех запросов и ошибок

9. ДОКУМЕНТАЦИЯ:
   - Swagger/OpenAPI спецификация
   - README с инструкцией по запуску

10. ТЕСТЫ:
    - Unit тесты для сервисов
    - Integration тесты для API

ОГРАНИЧЕНИЯ:
- Не использовать сторонние CMS
- Код должен быть типобезопасным
- Следовать принципам SOLID
- Использовать async/await
```

### 12.2 Задание для Frontend-агента (Публичный сайт)

```
ЗАДАНИЕ: Разработка Frontend публичного сайта ремонтно-строительной компании

ТЕХНОЛОГИЧЕСКИЙ СТЕК:
- Next.js 14.x с App Router
- TypeScript 5.x
- Tailwind CSS 3.x
- Framer Motion для анимаций
- Swiper для слайдеров
- React Hook Form + Zod
- TanStack Query для работы с API

ТРЕБОВАНИЯ:

1. СТРУКТУРА ПРОЕКТА:
   - App Router (app директория)
   - Компонентный подход
   - Разделение на ui/, layout/, sections/, forms/, shared/
   - Переиспользуемые хуки в hooks/

2. ДИЗАЙН:
   - Современный, минималистичный дизайн
   - Тёмная/светлая тема
   - Адаптивность (mobile-first)
   - Анимации при скролле и переходах
   - Плавные hover эффекты
   - Не использовать стандартные UI библиотеки, писать свои компоненты

3. СТРАНИЦЫ:
   Реализовать все страницы из раздела 6.1:
   - Главная с секциями
   - Каталог услуг с подстраницами
   - Портфолио с фильтрами
   - Блог с пагинацией
   - О компании
   - Вакансии
   - Контакты
   - Калькулятор

4. КОМПОНЕНТЫ:
   - Header с mega-menu навигацией
   - Footer
   - Хлебные крошки
   - Карточки услуг, проектов, статей
   - Слайдеры (Swiper)
   - Галерея изображений с lightbox
   - Слайдер сравнения "до/после"
   - Формы обратной связи
   - Модальные окна
   - Аккордеон для FAQ
   - Калькулятор

5. SEO:
   - generateMetadata для каждой страницы
   - Structured data (JSON-LD)
   - Sitemap и robots
   - Open Graph теги
   - Оптимизация изображений (next/image)

6. ПРОИЗВОДИТЕЛЬНОСТЬ:
   - SSG для статических страниц
   - SSR для динамических
   - Lazy loading компонентов
   - Code splitting
   - Оптимизация шрифтов

7. ФОРМЫ:
   - Валидация на клиенте (Zod)
   - Маски для телефона
   - Уведомления об успехе/ошибке
   - Защита от спама (honeypot)

8. ИНТЕГРАЦИЯ:
   - API клиент для работы с бэкендом
   - Обработка ошибок
   - Loading states
   - Error boundaries

9. СТИЛИСТИКА:
   - CSS переменные для цветов
   - Консистентные отступы и размеры
   - Типографика (заголовки, текст)
   - Интересные шрифты (не Inter/Roboto)

ОСОБЫЕ ТРЕБОВАНИЯ:
- Фокус на визуальной привлекательности
- Плавные анимации
- Высокая производительность (90+ Lighthouse)
- Доступность (a11y)
```

### 12.3 Задание для Frontend-агента (Админ-панель)

```
ЗАДАНИЕ: Разработка административной панели

ТЕХНОЛОГИЧЕСКИЙ СТЕК:
- React 18.x
- Vite 5.x
- TypeScript 5.x
- Ant Design или Shadcn/UI
- TanStack Query + TanStack Table
- React Router 6.x
- React Hook Form + Zod

ТРЕБОВАНИЯ:

1. СТРУКТУРА:
   - Модульная архитектура по страницам
   - Разделение на pages/, components/, layouts/, hooks/, services/

2. АУТЕНТИФИКАЦИЯ:
   - Страница логина
   - Защита роутов
   - Автоматический refresh токенов
   - Выход из системы

3. LAYOUT:
   - Боковая панель навигации (сворачиваемая)
   - Шапка с профилем пользователя
   - Хлебные крошки

4. СТРАНИЦЫ/МОДУЛИ:
   Реализовать все модули из раздела 6.2:
   - Dashboard со статистикой
   - Услуги (древовидная структура)
   - Проекты
   - Статьи
   - Заявки
   - Сотрудники
   - Отзывы
   - Вакансии
   - FAQ
   - Калькулятор
   - Медиатека
   - Настройки
   - Пользователи

5. КОМПОНЕНТЫ:
   - Таблицы с сортировкой, фильтрацией, пагинацией
   - Формы создания/редактирования
   - WYSIWYG редактор
   - Загрузчик изображений (drag-n-drop)
   - Древовидные списки
   - Модальные окна подтверждения
   - Уведомления (toast)
   - Предпросмотр контента

6. ФУНКЦИОНАЛ:
   - CRUD для всех сущностей
   - Массовые операции
   - Drag-n-drop сортировка
   - Экспорт данных (Excel)
   - Поиск

7. UX:
   - Оптимистичные обновления
   - Loading и error состояния
   - Подтверждение удаления
   - Unsaved changes предупреждение
   - Keyboard shortcuts

ДОПОЛНИТЕЛЬНО:
- Права доступа по ролям
- История изменений
- Responsive для планшетов
```

---

## 13. Этапы разработки

### Этап 1: Инициализация (1-2 дня)
- Настройка монорепозитория
- Docker конфигурация
- CI/CD пайплайн
- Базовая структура проектов

### Этап 2: Backend (2-3 недели)
- Prisma схема и миграции
- Аутентификация
- CRUD для всех сущностей
- Публичный API
- Загрузка файлов
- Калькулятор
- Email уведомления
- Тесты

### Этап 3: Админ-панель (2-3 недели)
- UI каркас
- Аутентификация
- Все модули управления
- Медиатека
- Настройки

### Этап 4: Публичный сайт (3-4 недели)
- UI компоненты
- Все страницы
- Формы
- Калькулятор
- SEO оптимизация
- Анимации

### Этап 5: Интеграция и тестирование (1 неделя)
- Интеграция frontend с backend
- E2E тесты
- Оптимизация производительности
- Исправление багов

### Этап 6: Деплой (2-3 дня)
- Настройка серверов
- SSL сертификаты
- Мониторинг
- Финальное тестирование

---

## 14. Файлы конфигурации

### docker-compose.yml (пример)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: magass
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/magass
      REDIS_URL: redis://redis:6379
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    ports:
      - "3000:3000"
    depends_on:
      - api

  admin:
    build:
      context: .
      dockerfile: docker/Dockerfile.admin
    ports:
      - "3001:3001"
    depends_on:
      - api

  nginx:
    image: nginx:alpine
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
      - admin
      - api

volumes:
  postgres_data:
  minio_data:
```

---

Это техническое задание охватывает все аспекты разработки сайта, аналогичного magass.ru, с современным технологическим стеком и чёткими инструкциями для агентов генерации кода.

