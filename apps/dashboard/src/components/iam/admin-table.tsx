'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Pencil, Trash2 } from 'lucide-react';
import type { Admin } from '@/hooks/use-admins';

interface AdminTableProps {
  admins: Admin[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDelete?: (admin: Admin) => void;
}

export function AdminTable({ admins, loading, error, onRetry, onDelete }: AdminTableProps) {
  const router = useRouter();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (admins.length === 0) {
    return (
      <EmptyState
        title="No hay administradores"
        description="Crea tu primer administrador para comenzar."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium">{admin.email}</TableCell>
              <TableCell>{admin.displayName}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {admin.roles.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Sin roles</span>
                  ) : (
                    admin.roles.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-xs">
                        {role.name}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={admin.isActive ? 'active' : 'inactive'} />
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(admin.createdAt).toLocaleDateString('es-AR')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/iam/admins/${admin.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(admin)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
