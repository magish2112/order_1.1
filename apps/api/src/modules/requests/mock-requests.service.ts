import { RequestStatus } from '@prisma/client';
import {
  CreateRequestInput,
  UpdateRequestStatusInput,
  AssignRequestInput,
  GetRequestsQuery,
} from './requests.schema';

// Временное хранилище заявок в памяти
let mockRequests: any[] = [];
let requestIdCounter = 1;

export class MockRequestsService {
  /**
   * Создать заявку
   */
  async createRequest(input: CreateRequestInput, sourceOverride?: string) {
    const { callbackDate, ...data } = input;

    const request = {
      id: `req-${requestIdCounter++}`,
      ...data,
      source: sourceOverride || data.source || 'website',
      callbackDate: callbackDate ? new Date(callbackDate) : null,
      status: RequestStatus.NEW,
      handledById: null,
      handledAt: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      handledBy: null,
    };

    mockRequests.push(request);

    console.log('📝 Новая заявка создана:', {
      id: request.id,
      name: request.name,
      phone: request.phone,
      source: request.source,
    });

    return request;
  }

  /**
   * Получить список заявок
   */
  async getRequests(query: GetRequestsQuery) {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    let filteredRequests = [...mockRequests];

    // Фильтрация по статусу
    if (filters.status) {
      filteredRequests = filteredRequests.filter(req => req.status === filters.status);
    }

    // Фильтрация по источнику
    if (filters.source) {
      filteredRequests = filteredRequests.filter(req => req.source === filters.source);
    }

    // Поиск
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredRequests = filteredRequests.filter(req => 
        req.name?.toLowerCase().includes(searchLower) ||
        req.phone?.toLowerCase().includes(searchLower) ||
        req.email?.toLowerCase().includes(searchLower) ||
        req.message?.toLowerCase().includes(searchLower)
      );
    }

    // Сортировка по дате создания (новые первыми)
    filteredRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filteredRequests.length;
    const items = filteredRequests.slice(skip, skip + limit);

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
    return mockRequests.find(req => req.id === id) || null;
  }

  /**
   * Обновить статус заявки
   */
  async updateRequestStatus(id: string, input: UpdateRequestStatusInput, userId?: string) {
    const requestIndex = mockRequests.findIndex(req => req.id === id);
    
    if (requestIndex === -1) {
      throw new Error('Заявка не найдена');
    }

    const request = mockRequests[requestIndex];
    
    request.status = input.status;
    request.notes = input.notes;
    request.updatedAt = new Date();

    if (input.status !== RequestStatus.NEW && userId) {
      request.handledById = userId;
      request.handledAt = new Date();
    }

    mockRequests[requestIndex] = request;

    console.log('📝 Статус заявки обновлен:', {
      id: request.id,
      status: request.status,
      notes: request.notes,
    });

    return request;
  }

  /**
   * Назначить заявку менеджеру
   */
  async assignRequest(id: string, input: AssignRequestInput) {
    const requestIndex = mockRequests.findIndex(req => req.id === id);
    
    if (requestIndex === -1) {
      throw new Error('Заявка не найдена');
    }

    const request = mockRequests[requestIndex];
    
    request.handledById = input.handledById;
    request.handledAt = new Date();
    request.status = RequestStatus.IN_PROGRESS;
    request.updatedAt = new Date();

    mockRequests[requestIndex] = request;

    return request;
  }

  /**
   * Получить статистику заявок
   */
  async getRequestsStats(dateFrom?: Date, dateTo?: Date) {
    let filteredRequests = [...mockRequests];

    if (dateFrom || dateTo) {
      filteredRequests = filteredRequests.filter(req => {
        const createdAt = new Date(req.createdAt);
        if (dateFrom && createdAt < dateFrom) return false;
        if (dateTo && createdAt > dateTo) return false;
        return true;
      });
    }

    const total = filteredRequests.length;
    
    const byStatus = filteredRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<RequestStatus, number>);

    const bySource = filteredRequests.reduce((acc, req) => {
      const source = req.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      bySource,
    };
  }
}

export default new MockRequestsService();
