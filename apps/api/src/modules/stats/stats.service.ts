import prisma from '../../config/database';
import redis from '../../config/redis';

export class StatsService {
  /**
   * Получить статистику для Hero секции (счетчики достижений)
   */
  async getHomepageStats() {
    const cacheKey = 'stats:homepage';

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const [projectsCount, employeesCount, reviewsCount, yearsExperience] = await Promise.all([
      prisma.project.count({
        where: { isActive: true },
      }),
      prisma.employee.count({
        where: { isActive: true },
      }),
      prisma.review.count({
        where: { isApproved: true },
      }),
      // Годы опыта можно получить из настроек или посчитать от даты создания первого проекта
      prisma.project.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }).then((firstProject) => {
        if (!firstProject) return 0;
        const years = Math.floor(
          (Date.now() - firstProject.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365)
        );
        return Math.max(years, 5); // Минимум 5 лет
      }),
    ]);

    const stats = {
      projects: projectsCount,
      employees: employeesCount,
      reviews: reviewsCount,
      yearsExperience,
    };

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(stats)); // 1 час
    }

    return stats;
  }

  /**
   * Получить статистику для Dashboard админки
   */
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalRequests,
      newRequests,
      requestsToday,
      totalProjects,
      activeProjects,
      totalArticles,
      publishedArticles,
      totalEmployees,
      activeEmployees,
      recentRequests,
    ] = await Promise.all([
      prisma.request.count(),
      prisma.request.count({
        where: {
          status: 'NEW',
        },
      }),
      prisma.request.count({
        where: {
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.project.count(),
      prisma.project.count({
        where: { isActive: true },
      }),
      prisma.article.count(),
      prisma.article.count({
        where: { isPublished: true },
      }),
      prisma.employee.count(),
      prisma.employee.count({
        where: { isActive: true },
      }),
      prisma.request.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          handledBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Статистика заявок по статусам
    const requestsByStatus = await prisma.request.groupBy({
      by: ['status'],
      _count: true,
    });

    // Статистика заявок за месяц
    const requestsThisMonth = await prisma.request.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      overview: {
        totalRequests,
        newRequests,
        requestsToday,
        requestsThisMonth,
        totalProjects,
        activeProjects,
        totalArticles,
        publishedArticles,
        totalEmployees,
        activeEmployees,
      },
      requestsByStatus: requestsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentRequests,
    };
  }

  /**
   * Получить статистику просмотров
   */
  async getViewsStats() {
    const [totalProjectViews, totalArticleViews] = await Promise.all([
      prisma.project.aggregate({
        _sum: {
          viewsCount: true,
        },
      }),
      prisma.article.aggregate({
        _sum: {
          viewsCount: true,
        },
      }),
    ]);

    return {
      totalProjectViews: totalProjectViews._sum.viewsCount || 0,
      totalArticleViews: totalArticleViews._sum.viewsCount || 0,
    };
  }
}

export default new StatsService();

