import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import { createUniqueSlug } from '../../utils/slug';
import { transformProject, stringifyJsonArray } from '../../utils/json-fields';
import {
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectsQuery,
} from './projects.schema';

export class ProjectsService {
  /**
   * Получить список проектов с фильтрацией
   */
  async getProjects(query: GetProjectsQuery) {
    const { page, limit, sortBy, sortOrder, search, tags, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.serviceId) {
      where.serviceIds = { has: filters.serviceId };
    }

    if (filters.propertyType) {
      where.propertyType = filters.propertyType;
    }

    if (filters.style) {
      where.style = filters.style;
    }

    if (filters.repairType) {
      where.repairType = filters.repairType;
    }

    if (filters.rooms) {
      where.rooms = filters.rooms;
    }

    if (filters.areaFrom || filters.areaTo) {
      where.area = {};
      if (filters.areaFrom) {
        where.area.gte = Prisma.Decimal(filters.areaFrom);
      }
      if (filters.areaTo) {
        where.area.lte = Prisma.Decimal(filters.areaTo);
      }
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      where.tags = {
        some: {
          slug: { in: tagList },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [{ order: 'asc' }];
    const sortField: Prisma.ProjectOrderByWithRelationInput = {};
    if (sortBy === 'viewsCount') {
      sortField.viewsCount = sortOrder;
    } else if (sortBy === 'price') {
      sortField.price = sortOrder;
    } else if (sortBy === 'completedAt') {
      sortField.completedAt = sortOrder;
    } else {
      sortField.createdAt = sortOrder;
    }
    orderBy.push(sortField);

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Преобразуем JSON поля (работает для SQLite и PostgreSQL)
    const transformedItems = items.map(item => transformProject(item));

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
   * Получить избранные проекты
   */
  async getFeaturedProjects(limit = 10) {
    const cacheKey = `projects:featured:${limit}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const projects = await prisma.project.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      take: limit,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(projects));
    }

    return projects;
  }

  /**
   * Получить проект по slug
   */
  async getProjectBySlug(slug: string, incrementViews = false) {
    const cacheKey = `project:${slug}`;

    if (redis && !incrementViews) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        category: true,
        services: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    // Преобразуем JSON поля для SQLite
    const transformedProject = transformProject(project);

    // Увеличиваем счетчик просмотров
    if (incrementViews) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          viewsCount: { increment: 1 },
        },
      });
      // Инвалидируем кеш
      if (redis) {
        await redis.del(cacheKey);
      }
    } else if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(transformedProject));
    }

    return transformedProject;
  }

  /**
   * Получить проект по ID (админ)
   */
  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        category: true,
        services: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    return transformProject(project);
  }

  /**
   * Создать проект
   */
  async createProject(input: CreateProjectInput, userId?: string) {
    const { tagNames, serviceIds, beforeImages, afterImages, designImages, ...data } = input;

    const slug = data.slug || (await createUniqueSlug(
      data.title,
      async (s) => {
        const exists = await prisma.project.findUnique({ where: { slug: s } });
        return !!exists;
      }
    ));

    // Обработка тегов
    const tagConnections: { id: string }[] = [];
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const tag = await prisma.projectTag.upsert({
          where: { slug: tagSlug },
          update: { name: tagName },
          create: {
            name: tagName,
            slug: tagSlug,
          },
        });
        tagConnections.push({ id: tag.id });
      }
    }

    // Обработка услуг
    const serviceConnections: { id: string }[] = [];
    if (serviceIds && serviceIds.length > 0) {
      serviceConnections.push(...serviceIds.map((id) => ({ id })));
    }

    // Преобразуем массивы в JSON (для SQLite) или оставляем как есть (для PostgreSQL)
    const projectData: any = {
      ...data,
      slug,
      serviceIds: stringifyJsonArray(serviceIds || []),
      beforeImages: stringifyJsonArray(beforeImages || []),
      afterImages: stringifyJsonArray(afterImages || []),
      designImages: stringifyJsonArray(designImages || []),
    };

    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (existingUser) {
        projectData.createdById = existingUser.id;
      }
    }

    const project = await prisma.project.create({
      data: {
        ...projectData,
        tags: {
          connect: tagConnections,
        },
        services: {
          connect: serviceConnections,
        },
      },
      include: {
        category: true,
        tags: true,
        services: true,
      },
    });

    await this.invalidateProjectsCache();

    return transformProject(project);
  }

  /**
   * Обновить проект
   */
  async updateProject(input: UpdateProjectInput) {
    const { id, tagNames, serviceIds, beforeImages, afterImages, designImages, ...inputData } = input;

    const data: any = { ...inputData };

    if (data.title && !data.slug) {
      data.slug = await createUniqueSlug(
        data.title,
        async (s) => {
          const exists = await prisma.project.findFirst({
            where: { slug: s, NOT: { id } },
          });
          return !!exists;
        }
      );
    }

    // Преобразуем массивы в JSON (для SQLite) или оставляем как есть (для PostgreSQL)
    if (beforeImages !== undefined) {
      data.beforeImages = stringifyJsonArray(beforeImages);
    }
    if (afterImages !== undefined) {
      data.afterImages = stringifyJsonArray(afterImages);
    }
    if (designImages !== undefined) {
      data.designImages = stringifyJsonArray(designImages);
    }

    // Обновление тегов
    if (tagNames !== undefined) {
      const tagConnections: { id: string }[] = [];
      for (const tagName of tagNames) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const tag = await prisma.projectTag.upsert({
          where: { slug: tagSlug },
          update: { name: tagName },
          create: {
            name: tagName,
            slug: tagSlug,
          },
        });
        tagConnections.push({ id: tag.id });
      }

      // Отключаем старые теги и подключаем новые
      const currentProject = await prisma.project.findUnique({
        where: { id },
        include: { tags: true },
      });

      await prisma.project.update({
        where: { id },
        data: {
          tags: {
            disconnect: currentProject?.tags.map((t) => ({ id: t.id })) || [],
            connect: tagConnections,
          },
        },
      });
    }

    // Обновление услуг
    if (serviceIds !== undefined) {
      const serviceConnections = serviceIds.map((serviceId) => ({ id: serviceId }));

      const currentProject = await prisma.project.findUnique({
        where: { id },
        include: { services: true },
      });

      await prisma.project.update({
        where: { id },
        data: {
          services: {
            disconnect: currentProject?.services.map((s) => ({ id: s.id })) || [],
            connect: serviceConnections,
          },
          serviceIds: stringifyJsonArray(serviceIds),
        },
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        category: true,
        tags: true,
        services: true,
      },
    });

    await this.invalidateProjectsCache();

    return transformProject(project);
  }

  /**
   * Удалить проект
   */
  async deleteProject(id: string) {
    await prisma.project.delete({ where: { id } });
    await this.invalidateProjectsCache();

    return { success: true };
  }

  /**
   * Инвалидация кеша проектов
   */
  private async invalidateProjectsCache() {
    if (!redis) return;

    const keys = await redis.keys('projects:*');
    const projectKeys = await redis.keys('project:*');
    
    if (keys.length > 0 || projectKeys.length > 0) {
      await redis.del(...keys, ...projectKeys);
    }
  }
}

export default new ProjectsService();

