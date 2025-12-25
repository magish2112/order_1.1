// Типы для API ответов

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EDITOR';
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Service Category
export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  parent?: ServiceCategory;
  children?: ServiceCategory[];
  createdAt: string;
  updatedAt: string;
}

// Service
export interface Service {
  id: string;
  slug: string;
  name: string;
  description?: string;
  content?: string;
  shortDescription?: string;
  priceFrom?: number;
  priceTo?: number;
  priceUnit?: string;
  image?: string;
  gallery: string[];
  duration?: string;
  features?: Record<string, any>;
  categoryId: string;
  category?: ServiceCategory;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

// Project
export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  area?: number;
  rooms?: number;
  duration?: number;
  price?: number;
  location?: string;
  completedAt?: string;
  style?: string;
  propertyType?: string;
  repairType?: string;
  coverImage?: string;
  beforeImages: string[];
  afterImages: string[];
  designImages: string[];
  videoUrl?: string;
  clientName?: string;
  clientReview?: string;
  clientPhoto?: string;
  categoryId?: string;
  category?: ServiceCategory;
  serviceIds: string[];
  services?: Service[];
  tags?: ProjectTag[];
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTag {
  id: string;
  name: string;
  slug: string;
}

// Article
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  readingTime?: number;
  authorId?: string;
  author?: User;
  categoryId?: string;
  category?: ArticleCategory;
  tags?: ArticleTag[];
  isPublished: boolean;
  publishedAt?: string;
  viewsCount: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  order: number;
}

export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
}

// Request
export interface Request {
  id: string;
  name: string;
  phone: string;
  email?: string;
  contactMethod?: 'phone' | 'telegram' | 'whatsapp';
  callbackDate?: string;
  message?: string;
  serviceType?: string;
  area?: number;
  budget?: string;
  source?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'CONVERTED' | 'REJECTED' | 'SPAM';
  handledById?: string;
  handledBy?: User;
  handledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Employee
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department?: string;
  photo?: string;
  bio?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review
export interface Review {
  id: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  rating: number;
  projectId?: string;
  project?: Project;
  source?: 'yandex' | 'google' | 'internal';
  sourceUrl?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Vacancy
export interface Vacancy {
  id: string;
  title: string;
  department?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  conditions: string[];
  salaryFrom?: number;
  salaryTo?: number;
  experience?: string;
  employment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// FAQ
export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Media
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  folder?: string;
  createdAt: string;
}

// Settings
export interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'json' | 'boolean';
  group?: string;
  createdAt: string;
  updatedAt: string;
}

// Stats
export interface DashboardStats {
  overview: {
    totalRequests: number;
    newRequests: number;
    requestsToday: number;
    requestsThisMonth: number;
    totalProjects: number;
    activeProjects: number;
    totalArticles: number;
    publishedArticles: number;
    totalEmployees: number;
    activeEmployees: number;
  };
  requestsByStatus: Record<string, number>;
  recentRequests: Request[];
}

export interface HomepageStats {
  projects: number;
  employees: number;
  reviews: number;
  yearsExperience: number;
}

// Calculator Config
export interface CalculatorConfig {
  id: string;
  name: string;
  basePriceCosmetic: number;
  basePriceCapital: number;
  basePriceDesign: number;
  basePriceElite: number;
  coefficients: Record<string, number>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

