import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import prisma from '../../src/config/database';

/**
 * Создает тестовый экземпляр приложения
 */
export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp();
  await app.ready();
  return app;
}

/**
 * Закрывает тестовое приложение
 */
export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close();
}

/**
 * Создает тестового пользователя
 */
export async function createTestUser(data?: {
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}) {
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash(data?.password || 'password123', 10);

  return prisma.user.create({
    data: {
      email: data?.email || 'test@example.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'User',
      role: (data?.role as any) || 'MANAGER',
      isActive: data?.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Создает тестовую категорию
 */
export async function createTestCategory(data?: {
  name?: string;
  slug?: string;
  parentId?: string;
  isActive?: boolean;
}) {
  return prisma.serviceCategory.create({
    data: {
      name: data?.name || 'Test Category',
      slug: data?.slug || 'test-category',
      description: 'Test description',
      isActive: data?.isActive !== undefined ? data.isActive : true,
      parentId: data?.parentId || null,
    },
  });
}

/**
 * Создает тестовую услугу
 */
export async function createTestService(data?: {
  name?: string;
  slug?: string;
  categoryId?: string;
  isActive?: boolean;
}) {
  // Создаем категорию, если не указана
  let categoryId = data?.categoryId;
  if (!categoryId) {
    const category = await createTestCategory();
    categoryId = category.id;
  }

  return prisma.service.create({
    data: {
      name: data?.name || 'Test Service',
      slug: data?.slug || 'test-service',
      description: 'Test service description',
      categoryId,
      isActive: data?.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Получает JWT токен для тестового пользователя
 */
export async function getAuthToken(
  app: FastifyInstance,
  email: string = 'test@example.com',
  password: string = 'password123'
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: {
      email,
      password,
    },
  });

  const body = JSON.parse(response.body);
  return body.data.tokens;
}

/**
 * Создает тестовый проект
 */
export async function createTestProject(data?: {
  title?: string;
  slug?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}) {
  let categoryId = data?.categoryId;
  if (!categoryId) {
    const category = await createTestCategory();
    categoryId = category.id;
  }

  return prisma.project.create({
    data: {
      title: data?.title || 'Test Project',
      slug: data?.slug || 'test-project',
      description: 'Test project description',
      categoryId,
      isActive: data?.isActive !== undefined ? data.isActive : true,
      isFeatured: data?.isFeatured !== undefined ? data.isFeatured : false,
    },
  });
}

/**
 * Создает тестовую статью
 */
export async function createTestArticle(data?: {
  title?: string;
  slug?: string;
  authorId?: string;
  categoryId?: string;
  isPublished?: boolean;
}) {
  let authorId = data?.authorId;
  if (!authorId) {
    const user = await createTestUser();
    authorId = user.id;
  }

  return prisma.article.create({
    data: {
      title: data?.title || 'Test Article',
      slug: data?.slug || 'test-article',
      content: 'Test article content',
      excerpt: 'Test excerpt',
      authorId,
      categoryId: data?.categoryId || null,
      isPublished: data?.isPublished !== undefined ? data.isPublished : false,
    },
  });
}

/**
 * Создает тестовую заявку
 */
export async function createTestRequest(data?: {
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
}) {
  return prisma.request.create({
    data: {
      name: data?.name || 'Test User',
      phone: data?.phone || '+79991234567',
      email: data?.email || 'test@example.com',
      status: (data?.status as any) || 'NEW',
    },
  });
}

/**
 * Создает тестового сотрудника
 */
export async function createTestEmployee(data?: {
  firstName?: string;
  lastName?: string;
  position?: string;
  department?: string;
  isActive?: boolean;
}) {
  return prisma.employee.create({
    data: {
      firstName: data?.firstName || 'John',
      lastName: data?.lastName || 'Doe',
      position: data?.position || 'Manager',
      department: data?.department || 'Management',
      isActive: data?.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Создает тестовый отзыв
 */
export async function createTestReview(data?: {
  authorName?: string;
  content?: string;
  rating?: number;
  projectId?: string;
  isApproved?: boolean;
}) {
  return prisma.review.create({
    data: {
      authorName: data?.authorName || 'Test User',
      content: data?.content || 'Great service!',
      rating: data?.rating || 5,
      projectId: data?.projectId || null,
      isApproved: data?.isApproved !== undefined ? data.isApproved : false,
    },
  });
}

/**
 * Создает тестовую вакансию
 */
export async function createTestVacancy(data?: {
  title?: string;
  department?: string;
  isActive?: boolean;
}) {
  return prisma.vacancy.create({
    data: {
      title: data?.title || 'Test Vacancy',
      department: data?.department || 'Development',
      description: 'Test vacancy description',
      requirements: ['Requirement 1', 'Requirement 2'],
      responsibilities: ['Responsibility 1'],
      conditions: ['Condition 1'],
      isActive: data?.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Создает тестовый FAQ
 */
export async function createTestFaq(data?: {
  question?: string;
  answer?: string;
  category?: string;
  isActive?: boolean;
}) {
  return prisma.faq.create({
    data: {
      question: data?.question || 'Test Question?',
      answer: data?.answer || 'Test Answer',
      category: data?.category || null,
      isActive: data?.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Создает тестовую настройку
 */
export async function createTestSetting(data?: {
  key?: string;
  value?: string;
  type?: string;
  group?: string;
}) {
  return prisma.setting.create({
    data: {
      key: data?.key || 'test.key',
      value: data?.value || 'test value',
      type: data?.type || 'string',
      group: data?.group || null,
    },
  });
}

