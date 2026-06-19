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
import { SearchInput } from '@/components/shared/search-input';
import { Pencil, Trash2 } from 'lucide-react';
import type { Store } from '@/hooks/use-stores';

interface StoreTableProps {
  stores: Store[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
}

export function StoreTable({
  stores,
  loading,
  error,
  onRetry,
  search,
  onSearchChange,
  onEdit,
  onDelete,
}: StoreTableProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (stores.length === 0) {
    return (
      <EmptyState
        title={search ? 'Sin resultados' : 'No hay tiendas'}
        description={search ? 'No se encontraron tiendas con ese nombre.' : 'Crea tu primera tienda para comenzar.'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        placeholder="Buscar por nombre..."
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{store.slug}</TableCell>
                <TableCell>{store.currency}</TableCell>
                <TableCell>{store.plan?.name ?? store.planName ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={store.isActive ? 'active' : 'inactive'} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(store)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(store)}
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
    </div>
  );
}
