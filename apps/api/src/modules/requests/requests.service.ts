import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import emailService from '../../services/email.service';
import { RequestStatus, RequestStatusType } from '../../constants/roles';
import {
  CreateRequestInput,
  UpdateRequestStatusInput,
  AssignRequestInput,
  GetRequestsQuery,
} from './requests.schema';

export class RequestsService {
  /**
   * Создать заявку
   */
  async createRequest(input: CreateRequestInput, sourceOverride?: string) {
    const { callbackDate, ...data } = input;

    const request = await prisma.request.create({
      data: {
        ...data,
        source: sourceOverride || data.source || 'website',
        callbackDate: callbackDate ? new Date(callbackDate) : null,
        status: RequestStatus.NEW,
      },
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
    });

    // ✅ Отправить email уведомление администратору
    await emailService.sendRequestNotification(request);

    // ✅ Отправить подтверждение клиенту (если есть email)
    if (request.email) {
      await emailService.sendRequestConfirmation(request.email, request.name);
    }

    return request;
  }

  /**
   * Получить список заявок
   */
  async getRequests(query: GetRequestsQuery) {
    const { page, limit, dateFrom, dateTo, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RequestWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.handledById) {
      where.handledById = filters.handledById;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [items, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take: limit,
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
      prisma.request.count({ where }),
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
   * Получить заявку по ID
   */
  async getRequestById(id: string) {
    const request = await prisma.request.findUnique({
      where: { id },
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
    });

    return request;
  }

  /**
   * Обновить статус заявки
   */
  async updateRequestStatus(id: string, input: UpdateRequestStatusInput, userId?: string) {
    const updateData: Prisma.RequestUpdateInput = {
      status: input.status,
      notes: input.notes,
    };

    if (input.status !== RequestStatus.NEW && !userId) {
      throw new Error('Необходимо указать пользователя для изменения статуса');
    }

    if (input.status === RequestStatus.IN_PROGRESS || input.status === RequestStatus.CONTACTED) {
      updateData.handledById = userId;
      updateData.handledAt = new Date();
    }

    const request = await prisma.request.update({
      where: { id },
      data: updateData,
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
    });

    return request;
  }

  /**
   * Назначить заявку менеджеру
   */
  async assignRequest(id: string, input: AssignRequestInput) {
    const request = await prisma.request.update({
      where: { id },
      data: {
        handledById: input.handledById,
        handledAt: new Date(),
        status: RequestStatus.IN_PROGRESS,
      },
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
    });

    return request;
  }

  /**
   * Получить статистику заявок
   */
  async getRequestsStats(dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.RequestWhereInput = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    const [total, byStatus, bySource] = await Promise.all([
      prisma.request.count({ where }),
      prisma.request.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.request.groupBy({
        by: ['source'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<RequestStatusType, number>),
      bySource: bySource.reduce((acc, item) => {
        acc[item.source || 'unknown'] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export default new RequestsService();

