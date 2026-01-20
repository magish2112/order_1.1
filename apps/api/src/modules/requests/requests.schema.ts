import { z } from 'zod';
import { RequestStatus, RequestStatusType } from '../../constants/roles';

const requestStatusValues = Object.values(RequestStatus) as [
  RequestStatusType,
  ...RequestStatusType[]
];

export const createRequestSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  email: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().email().optional()
  ),
  contactMethod: z.enum(['phone', 'telegram', 'whatsapp']).optional(),
  callbackDate: z.string().datetime().optional(),
  message: z.string().optional(),
  serviceType: z.string().optional(),
  area: z.number().positive().optional(),
  budget: z.string().optional(),
  source: z.string().optional(),
  pageUrl: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(requestStatusValues),
  notes: z.string().optional(),
});

export const assignRequestSchema = z.object({
  handledById: z.string(),
});

export const getRequestsQuerySchema = z.object({
  status: z.enum(requestStatusValues).optional(),
  handledById: z.string().optional(),
  source: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type AssignRequestInput = z.infer<typeof assignRequestSchema>;
export type GetRequestsQuery = z.infer<typeof getRequestsQuerySchema>;

