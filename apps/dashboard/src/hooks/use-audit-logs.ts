'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from './use-api';
import type { PaginatedResult } from '@commerce/shared';

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  adminEmail?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const api = useApi();
  const { page = 1, limit = 50, action, adminEmail, entityType, startDate, endDate } = filters;

  return useQuery<PaginatedResult<AuditLog>>({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (action) params.action = action;
      if (adminEmail) params.adminEmail = adminEmail;
      if (entityType) params.entityType = entityType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      return api.get<PaginatedResult<AuditLog>>('/audit-logs', { params });
    },
  });
}
