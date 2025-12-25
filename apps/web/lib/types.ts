export interface ServiceCategory {
  id: string
  slug: string
  name: string
  description?: string
  shortDescription?: string
  image?: string
  icon?: string
  parentId?: string
  order: number
  isActive: boolean
  metaTitle?: string
  metaDescription?: string
  children?: ServiceCategory[]
  services?: Service[]
}

export interface Service {
  id: string
  slug: string
  name: string
  description?: string
  content?: string
  shortDescription?: string
  priceFrom?: number
  priceTo?: number
  priceUnit?: string
  image?: string
  gallery?: string[]
  duration?: string
  features?: Record<string, unknown>
  categoryId: string
  order: number
  isActive: boolean
  isFeatured: boolean
  metaTitle?: string
  metaDescription?: string
  category?: ServiceCategory
}

export interface Project {
  id: string
  slug: string
  title: string
  description?: string
  content?: string
  area?: number
  rooms?: number
  duration?: number
  price?: number
  location?: string
  completedAt?: string
  style?: string
  propertyType?: string
  repairType?: string
  coverImage?: string
  beforeImages?: string[]
  afterImages?: string[]
  designImages?: string[]
  videoUrl?: string
  clientName?: string
  clientReview?: string
  clientPhoto?: string
  categoryId?: string
  serviceIds?: string[]
  order: number
  isActive: boolean
  isFeatured: boolean
  viewsCount: number
  metaTitle?: string
  metaDescription?: string
  category?: ServiceCategory
  services?: Service[]
  tags?: ProjectTag[]
}

export interface ProjectTag {
  id: string
  name: string
  slug: string
}

export interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  readingTime?: number
  authorId?: string
  categoryId?: string
  isPublished: boolean
  publishedAt?: string
  viewsCount: number
  metaTitle?: string
  metaDescription?: string
  author?: User
  category?: ArticleCategory
  tags?: ArticleTag[]
}

export interface ArticleCategory {
  id: string
  slug: string
  name: string
  description?: string
  order: number
}

export interface ArticleTag {
  id: string
  name: string
  slug: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
  department?: string
  photo?: string
  bio?: string
  order: number
  isActive: boolean
}

export interface Review {
  id: string
  authorName: string
  authorPhoto?: string
  content: string
  rating: number
  projectId?: string
  source?: string
  sourceUrl?: string
  isApproved: boolean
  createdAt: string
}

export interface Faq {
  id: string
  question: string
  answer: string
  category?: string
  order: number
  isActive: boolean
}

export interface Vacancy {
  id: string
  title: string
  department?: string
  description: string
  requirements?: string[]
  responsibilities?: string[]
  conditions?: string[]
  salaryFrom?: number
  salaryTo?: number
  experience?: string
  employment?: string
  isActive: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EDITOR'
}

export interface Request {
  id: string
  name: string
  phone: string
  email?: string
  contactMethod?: string
  callbackDate?: string
  message?: string
  serviceType?: string
  area?: number
  budget?: string
  source?: string
  pageUrl?: string
  status: 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'CONVERTED' | 'REJECTED' | 'SPAM'
  createdAt: string
}

export interface CalculatorConfig {
  id: string
  name: string
  basePriceCosmetic: number
  basePriceCapital: number
  basePriceDesign: number
  basePriceElite: number
  coefficients: Record<string, number>
  isActive: boolean
}

export interface CalculatorRequest {
  propertyType: 'apartment' | 'house' | 'office'
  housingType: 'newBuilding' | 'secondary'
  rooms: number
  area: number
  repairType: 'cosmetic' | 'capital' | 'design' | 'elite'
  additionalServices?: string[]
  name: string
  phone: string
  email?: string
}

