import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import { createUniqueSlug } from '../../utils/slug';
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

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    if (sortBy === 'viewsCount') {
      orderBy.viewsCount = sortOrder;
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'completedAt') {
      orderBy.completedAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }
    orderBy.order = 'asc';

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

    return {
      items,
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
      await redis.setex(cacheKey, 300, JSON.stringify(project));
    }

    return project;
  }

  /**
   * Создать проект
   */
  async createProject(input: CreateProjectInput, userId?: string) {
    const { tagNames, serviceIds, ...data } = input;

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

    const project = await prisma.project.create({
      data: {
        ...data,
        slug,
        serviceIds: serviceIds || [],
        createdById: userId,
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

    return project;
  }

  /**
   * Обновить проект
   */
  async updateProject(input: UpdateProjectInput) {
    const { id, tagNames, serviceIds, ...data } = input;

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
          serviceIds: serviceIds,
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

    return project;
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

