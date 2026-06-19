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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Pencil, Trash2, ShieldAlert } from 'lucide-react';
import type { Role } from '@/hooks/use-roles';

interface RoleTableProps {
  roles: Role[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDelete?: (role: Role) => void;
}

export function RoleTable({ roles, loading, error, onRetry, onDelete }: RoleTableProps) {
  const router = useRouter();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (roles.length === 0) {
    return (
      <EmptyState
        title="No hay roles"
        description="Crea tu primer rol para comenzar."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Alcance</TableHead>
            <TableHead>Permisos</TableHead>
            <TableHead>Sistema</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs capitalize">
                  {role.scope === 'tenant' ? 'Tenant' : 'Tienda'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {role.permissionCount ?? role.permissions?.length ?? 0}
              </TableCell>
              <TableCell>
                {role.isSystem ? (
                  <Badge variant="info" className="text-xs">
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Sistema
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(role.createdAt).toLocaleDateString('es-AR')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/iam/roles/${role.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {role.isSystem ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button variant="ghost" size="icon" disabled className="text-destructive/40">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Los roles de sistema no se pueden eliminar
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(role)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
