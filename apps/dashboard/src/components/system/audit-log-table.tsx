'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { AuditLogDetail } from './audit-log-detail';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuditLog } from '@/hooks/use-audit-logs';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AuditLogTable({ logs, loading, error, onRetry }: AuditLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (logs.length === 0) {
    return (
      <EmptyState
        title="Sin registros"
        description="No se encontraron registros de auditoría con los filtros seleccionados."
      />
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="group">
              <TableCell className="w-8">
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="p-0.5 rounded hover:bg-accent transition-colors"
                >
                  {expandedId === log.id ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                {new Date(log.timestamp).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell className="text-sm">{log.adminEmail}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  {log.action}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{log.entityType}</TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground max-w-[100px] truncate">
                {log.entityId}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {expandedId && (
        <div className="border-t px-4 py-3 bg-muted/30">
          {(() => {
            const log = logs.find((l) => l.id === expandedId);
            if (!log) return null;
            return (
              <AuditLogDetail
                oldValue={log.oldValue}
                newValue={log.newValue}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}
