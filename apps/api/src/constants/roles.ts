// Константы для ролей пользователей (используем String вместо enum для совместимости)
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EDITOR: 'EDITOR',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Константы для статусов заявок
export const RequestStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  CONTACTED: 'CONTACTED',
  CONVERTED: 'CONVERTED',
  REJECTED: 'REJECTED',
  SPAM: 'SPAM',
} as const;

export type RequestStatusType = typeof RequestStatus[keyof typeof RequestStatus];
