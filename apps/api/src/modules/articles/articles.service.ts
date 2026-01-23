import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import { createUniqueSlug } from '../../utils/slug';
import {
  CreateArticleInput,
  UpdateArticleInput,
  GetArticlesQuery,
  CreateArticleCategoryInput,
  UpdateArticleCategoryInput,
} from './articles.schema';

export class ArticlesService {
  /**
   * Получить список статей
   */
  async getArticles(query: GetArticlesQuery, includeUnpublished = false) {
    const { page, limit, sortBy, sortOrder, search, tag, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};

    if (!includeUnpublished) {
      where.isPublished = true;
      where.publishedAt = { lte: new Date() };
    } else if (filters.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput = {};
    if (sortBy === 'viewsCount') {
      orderBy.viewsCount = sortOrder;
    } else if (sortBy === 'publishedAt') {
      orderBy.publishedAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
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
      }),
      prisma.article.count({ where }),
    ]);

    // Вычисляем время чтения для каждой статьи
    const articlesWithReadingTime = items.map((article) => {
      const wordsPerMinute = 200;
      const wordCount = article.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);

      return {
        ...article,
        readingTime: article.readingTime || readingTime,
      };
    });

    return {
      items: articlesWithReadingTime,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить категории статей
   */
  async getArticleCategories() {
    const cacheKey = 'article:categories';

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const categories = await prisma.articleCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: {
                isPublished: true,
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
    });

    if (redis) {
      await redis.setex(cacheKey, 600, JSON.stringify(categories)); // 10 минут
    }

    return categories;
  }

  /**
   * Получить статью по ID
   */
  async getArticleById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        tags: true,
      },
    });

    if (!article) {
      return null;
    }

    // Вычисляем время чтения
    const wordsPerMinute = 200;
    const wordCount = article.content.split(/\s+/).length;
    const readingTime = article.readingTime || Math.ceil(wordCount / wordsPerMinute);

    return {
      ...article,
      readingTime,
    };
  }

  /**
   * Получить статью по slug
   */
  async getArticleBySlug(slug: string, incrementViews = false) {
    const cacheKey = `article:${slug}`;

    if (redis && !incrementViews) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        tags: true,
      },
    });

    if (!article) {
      return null;
    }

    // Увеличиваем счетчик просмотров
    if (incrementViews && article.isPublished) {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          viewsCount: { increment: 1 },
        },
      });
      if (redis) {
        await redis.del(cacheKey);
      }
    } else if (redis) {
      await redis.setex(cacheKey, 300, JSON.stringify(article));
    }

    // Вычисляем время чтения
    const wordsPerMinute = 200;
    const wordCount = article.content.split(/\s+/).length;
    const readingTime = article.readingTime || Math.ceil(wordCount / wordsPerMinute);

    return {
      ...article,
      readingTime,
    };
  }

  /**
   * Создать статью
   */
  async createArticle(input: CreateArticleInput, userId?: string) {
    const { tagNames, publishedAt, ...data } = input;

    const slug = data.slug || (await createUniqueSlug(
      data.title,
      async (s) => {
        const exists = await prisma.article.findUnique({ where: { slug: s } });
        return !!exists;
      }
    ));

    // Обработка тегов
    const tagConnections: { id: string }[] = [];
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const tag = await prisma.articleTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug,
          },
        });
        tagConnections.push({ id: tag.id });
      }
    }

    // Санитизация HTML контента (защита от XSS)
    const { sanitizeHtml } = await import('../../utils/html-sanitizer');
    const sanitizedContent = sanitizeHtml(data.content);
    const sanitizedExcerpt = data.excerpt ? sanitizeHtml(data.excerpt) : undefined;

    // Вычисляем время чтения
    const wordsPerMinute = 200;
    const wordCount = sanitizedContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    const article = await prisma.article.create({
      data: {
        ...data,
        content: sanitizedContent,
        excerpt: sanitizedExcerpt,
        slug,
        authorId: userId || data.authorId,
        publishedAt: data.isPublished && publishedAt ? new Date(publishedAt) : (data.isPublished ? new Date() : null),
        readingTime,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        author: true,
        category: true,
        tags: true,
      },
    });

    await this.invalidateArticlesCache();

    return article;
  }

  /**
   * Обновить статью
   */
  async updateArticle(input: UpdateArticleInput) {
    const { id, tagNames, publishedAt, content, ...data } = input;

    if (data.title && !data.slug) {
      data.slug = await createUniqueSlug(
        data.title,
        async (s) => {
          const exists = await prisma.article.findFirst({
            where: { slug: s, NOT: { id } },
          });
          return !!exists;
        }
      );
    }

    // Санитизация HTML контента если он обновляется
    if (content) {
      const { sanitizeHtml } = await import('../../utils/html-sanitizer');
      data.content = sanitizeHtml(content);
      
      const wordsPerMinute = 200;
      const wordCount = data.content.split(/\s+/).length;
      data.readingTime = Math.ceil(wordCount / wordsPerMinute);
    }
    
    // Санитизация excerpt если обновляется
    if (data.excerpt) {
      const { sanitizeHtml } = await import('../../utils/html-sanitizer');
      data.excerpt = sanitizeHtml(data.excerpt);
    }

    // Обновление тегов
    if (tagNames !== undefined) {
      const tagConnections: { id: string }[] = [];
      for (const tagName of tagNames) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const tag = await prisma.articleTag.upsert({
          where: { slug: tagSlug },
          update: { name: tagName },
          create: {
            name: tagName,
            slug: tagSlug,
          },
        });
        tagConnections.push({ id: tag.id });
      }

      const currentArticle = await prisma.article.findUnique({
        where: { id },
        include: { tags: true },
      });

      await prisma.article.update({
        where: { id },
        data: {
          tags: {
            disconnect: currentArticle?.tags.map((t) => ({ id: t.id })) || [],
            connect: tagConnections,
          },
        },
      });
    }

    // Обновление даты публикации
    if (publishedAt !== undefined) {
      data.publishedAt = publishedAt ? new Date(publishedAt) : null;
    } else if (data.isPublished === true) {
      // Если статья публикуется впервые, устанавливаем текущую дату
      const currentArticle = await prisma.article.findUnique({ where: { id } });
      if (currentArticle && !currentArticle.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data,
      include: {
        author: true,
        category: true,
        tags: true,
      },
    });

    await this.invalidateArticlesCache();

    return article;
  }

  /**
   * Удалить статью
   */
  async deleteArticle(id: string) {
    await prisma.article.delete({ where: { id } });
    await this.invalidateArticlesCache();

    return { success: true };
  }

  /**
   * Публикация статьи
   */
  async publishArticle(id: string) {
    const article = await prisma.article.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    await this.invalidateArticlesCache();

    return article;
  }

  /**
   * Инвалидация кеша статей
   */
  private async invalidateArticlesCache() {
    if (!redis) return;

    const keys = await redis.keys('article:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  /**
   * ✅ Получить категорию статей по slug
   */
  async getArticleCategoryBySlug(slug: string) {
    const category = await prisma.articleCategory.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { isPublished: true, publishedAt: { lte: new Date() } },
          orderBy: { publishedAt: 'desc' },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
            tags: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return category;
  }

  /**
   * ✅ Создать категорию статей
   */
  async createArticleCategory(input: CreateArticleCategoryInput) {
    const slug = input.slug || (await createUniqueSlug(input.name, 'articleCategory'));

    const category = await prisma.articleCategory.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        order: input.order,
      },
    });

    // Инвалидировать кеш категорий
    if (redis) {
      await redis.del('article:categories');
    }

    return category;
  }

  /**
   * ✅ Обновить категорию статей
   */
  async updateArticleCategory(input: UpdateArticleCategoryInput) {
    if (!input.id) {
      throw new Error('ID категории обязателен');
    }

    const category = await prisma.articleCategory.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.slug && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });

    // Инвалидировать кеш
    if (redis) {
      await redis.del('article:categories');
    }

    return category;
  }

  /**
   * ✅ Удалить категорию статей
   */
  async deleteArticleCategory(id: string) {
    await prisma.articleCategory.delete({
      where: { id },
    });

    // Инвалидировать кеш
    if (redis) {
      await redis.del('article:categories');
    }
  }
}

export default new ArticlesService();

