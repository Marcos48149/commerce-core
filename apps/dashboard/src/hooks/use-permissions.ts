'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
  key: string;
}

export interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

export function usePermissions() {
  const api = useApi();
  return useQuery<PermissionGroup[]>({
    queryKey: ['permissions'],
    queryFn: () => api.get<PermissionGroup[]>('/iam/permissions'),
  });
}
