import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import { createUniqueSlug } from '../../utils/slug';
import { transformService, stringifyJsonArray, stringifyJsonObject } from '../../utils/json-fields';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateServiceInput,
  UpdateServiceInput,
  GetServicesQuery,
} from './services.schema';

export class ServicesService {
  // ==================== КАТЕГОРИИ ====================

  /**
   * Получить дерево категорий
   */
  async getCategoriesTree(isActive?: boolean) {
    const cacheKey = `categories:tree:${isActive ?? 'all'}`;

    // Проверка кеша
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const where: Prisma.ServiceCategoryWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const categories = await prisma.serviceCategory.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        parent: true,
        _count: {
          select: {
            services: isActive !== undefined ? { where: { isActive } } : true,
            children: true,
          },
        },
      },
    });

    // Построение дерева
    const tree = this.buildCategoryTree(categories);

    // Сохранение в кеш на 5 минут
    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(tree));
    }

    return tree;
  }

  /**
   * Построение дерева категорий
   */
  private buildCategoryTree(categories: Array<{
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    shortDescription?: string | null;
    image?: string | null;
    icon?: string | null;
    parentId?: string | null;
    order: number;
    isActive: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>) {
    type CategoryNode = typeof categories[0] & { children: CategoryNode[] };
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    // Создаем карту всех категорий
    categories.forEach((category) => {
      map.set(category.id, { ...category, children: [] });
    });

    // Строим дерево
    categories.forEach((category) => {
      const node = map.get(category.id);
      if (category.parentId) {
        const parent = map.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Получить категорию по slug
   */
  async getCategoryBySlug(slug: string) {
    const cacheKey = `category:${slug}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (category && redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(category));
    }

    return category;
  }

  /**
   * Получить список категорий (админ)
   */
  async getCategoriesList(isActive?: boolean) {
    const where: Prisma.ServiceCategoryWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return prisma.serviceCategory.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        parent: true,
      },
    });
  }

  /**
   * Получить категорию по ID (админ)
   */
  async getCategoryById(id: string) {
    return prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    });
  }

  /**
   * Создать категорию
   */
  async createCategory(input: CreateCategoryInput) {
    const slug = input.slug || (await createUniqueSlug(
      input.name,
      async (s) => {
        const exists = await prisma.serviceCategory.findUnique({ where: { slug: s } });
        return !!exists;
      }
    ));

    const category = await prisma.serviceCategory.create({
      data: {
        ...input,
        slug,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    // Инвалидация кеша
    await this.invalidateCategoriesCache();

    return category;
  }

  /**
   * Обновить категорию
   */
  async updateCategory(input: UpdateCategoryInput) {
    const { id, ...data } = input;

    if (data.name && !data.slug) {
      data.slug = await createUniqueSlug(
        data.name,
        async (s) => {
          const exists = await prisma.serviceCategory.findFirst({
            where: { slug: s, NOT: { id } },
          });
          return !!exists;
        }
      );
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });

    await this.invalidateCategoriesCache();

    return category;
  }

  /**
   * Удалить категорию
   */
  async deleteCategory(id: string) {
    // Проверка наличия дочерних категорий и услуг
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        children: true,
        services: true,
      },
    });

    if (!category) {
      throw new Error('Категория не найдена');
    }

    if (category.children.length > 0) {
      throw new Error('Нельзя удалить категорию с дочерними категориями');
    }

    if (category.services.length > 0) {
      throw new Error('Нельзя удалить категорию с услугами');
    }

    await prisma.serviceCategory.delete({ where: { id } });
    await this.invalidateCategoriesCache();

    return { success: true };
  }

  // ==================== УСЛУГИ ====================

  /**
   * Получить список услуг
   */
  async getServices(query: GetServicesQuery) {
    const { page, limit, categoryId, isActive, isFeatured, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    // Преобразуем JSON поля (работает для SQLite и PostgreSQL)
    const transformedItems = items.map(item => transformService(item));

    return {
      items: transformedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить услугу по slug
   */
  async getServiceBySlug(slug: string) {
    const cacheKey = `service:${slug}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        category: true,
        pricingItems: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!service) {
      return null;
    }

    // Преобразуем JSON поля (работает для SQLite и PostgreSQL)
    const transformedService = transformService(service);

    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(transformedService));
    }

    return transformedService;
  }

  /**
   * Получить услугу по ID (админ)
   */
  async getServiceById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        pricingItems: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!service) {
      return null;
    }

    return transformService(service);
  }

  /**
   * Создать услугу
   */
  async createService(input: CreateServiceInput) {
    const slug = input.slug || (await createUniqueSlug(
      input.name,
      async (s) => {
        const exists = await prisma.service.findUnique({ where: { slug: s } });
        return !!exists;
      }
    ));

    // Санитизация HTML контента (защита от XSS)
    const { sanitizeHtml } = await import('../../utils/html-sanitizer');
    const sanitizedContent = input.content ? sanitizeHtml(input.content) : undefined;
    const sanitizedDescription = input.description ? sanitizeHtml(input.description) : undefined;
    const sanitizedShortDescription = input.shortDescription ? sanitizeHtml(input.shortDescription) : undefined;

    // Преобразуем массивы и объекты в JSON (для SQLite) или оставляем как есть (для PostgreSQL)
    const data: {
      name: string;
      slug: string;
      description?: string;
      content?: string;
      shortDescription?: string;
      priceFrom?: number;
      priceTo?: number;
      priceUnit?: string;
      image?: string;
      gallery?: unknown;
      duration?: string;
      features?: unknown;
      categoryId: string;
      order?: number;
      isActive?: boolean;
      isFeatured?: boolean;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
    } = {
      ...input,
      slug,
      content: sanitizedContent,
      description: sanitizedDescription,
      shortDescription: sanitizedShortDescription,
    };
    
    if (input.gallery) {
      data.gallery = stringifyJsonArray(input.gallery);
    }
    
    if (input.features) {
      data.features = stringifyJsonObject(input.features);
    }

    const service = await prisma.service.create({
      data,
      include: {
        category: true,
      },
    });

    await this.invalidateServicesCache();

    return transformService(service);
  }

  /**
   * Обновить услугу
   */
  async updateService(input: UpdateServiceInput) {
    const { id, ...inputData } = input;

    // Санитизация HTML контента если обновляется
    const { sanitizeHtml } = await import('../../utils/html-sanitizer');
    if (inputData.content) {
      inputData.content = sanitizeHtml(inputData.content);
    }
    if (inputData.description) {
      inputData.description = sanitizeHtml(inputData.description);
    }
    if (inputData.shortDescription) {
      inputData.shortDescription = sanitizeHtml(inputData.shortDescription);
    }

    const data: Partial<{
      name: string;
      slug: string;
      description?: string;
      content?: string;
      shortDescription?: string;
      priceFrom?: number;
      priceTo?: number;
      priceUnit?: string;
      image?: string;
      gallery?: unknown;
      duration?: string;
      features?: unknown;
      categoryId?: string;
      order?: number;
      isActive?: boolean;
      isFeatured?: boolean;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
    }> = { ...inputData };

    if (data.name && !data.slug) {
      data.slug = await createUniqueSlug(
        data.name,
        async (s) => {
          const exists = await prisma.service.findFirst({
            where: { slug: s, NOT: { id } },
          });
          return !!exists;
        }
      );
    }

    // Преобразуем массивы и объекты в JSON (для SQLite) или оставляем как есть (для PostgreSQL)
    if (data.gallery !== undefined) {
      data.gallery = stringifyJsonArray(data.gallery);
    }
    
    if (data.features !== undefined) {
      data.features = stringifyJsonObject(data.features);
    }

    const service = await prisma.service.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    await this.invalidateServicesCache();

    return transformService(service);
  }

  /**
   * Удалить услугу
   */
  async deleteService(id: string) {
    await prisma.service.delete({ where: { id } });
    await this.invalidateServicesCache();

    return { success: true };
  }

  // ==================== КЕШИРОВАНИЕ ====================

  /**
   * Инвалидация кеша категорий
   */
  private async invalidateCategoriesCache() {
    if (!redis) return;

    const keys = await redis.keys('categories:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  /**
   * Инвалидация кеша услуг
   */
  private async invalidateServicesCache() {
    if (!redis) return;

    const keys = await redis.keys('service:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new ServicesService();

