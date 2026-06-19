'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { KeyRound, Ban } from 'lucide-react';
import type { ApiKey } from '@/hooks/use-api-keys';

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRevoke?: (key: ApiKey) => void;
}

export function ApiKeyTable({ apiKeys, loading, error, onRetry, onRevoke }: ApiKeyTableProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (apiKeys.length === 0) {
    return (
      <EmptyState
        title="No hay API Keys"
        description="Crea tu primera API Key para comenzar."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead>Último uso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  {key.name}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {key.prefix?.substring(0, 8) ?? '***'}****
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {key.lastUsedAt
                  ? new Date(key.lastUsedAt).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Nunca'}
              </TableCell>
              <TableCell>
                <StatusBadge status={key.isActive ? 'active' : 'inactive'} />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRevoke?.(key)}
                  className="text-destructive"
                  title="Revocar"
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
