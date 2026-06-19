'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { usePermissions, type PermissionGroup } from '@/hooks/use-permissions';
import { Shield } from 'lucide-react';

interface PermissionListProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function PermissionList({ loading, error, onRetry }: PermissionListProps) {
  const { data: groups, isLoading, isError, refetch } = usePermissions();

  const isLoadingState = loading ?? isLoading;
  const isErrorState = error != null || isError;

  if (isLoadingState) return <LoadingSkeleton />;
  if (isErrorState) return <ErrorState message={error ?? 'Error al cargar permisos'} onRetry={onRetry ?? (() => refetch())} />;

  if (!groups || groups.length === 0) {
    return (
      <EmptyState
        title="No hay permisos"
        description="No se encontraron permisos configurados."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {groups.map((group) => (
        <Card key={group.category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {group.category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {group.permissions.map((perm) => (
                <li key={perm.id} className="text-sm">
                  <p className="font-medium">{perm.name}</p>
                  {perm.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{perm.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
