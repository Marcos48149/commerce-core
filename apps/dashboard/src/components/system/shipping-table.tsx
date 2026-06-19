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
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Pencil, Trash2 } from 'lucide-react';
import type { ShippingMethod } from '@/hooks/use-shipping';

const SHIPPING_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  flat: { label: 'Tarifa fija', className: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  weight: { label: 'Peso', className: 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
  free: { label: 'Gratis', className: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
};

function formatARS(amount: number | null): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
}

interface ShippingTableProps {
  methods: ShippingMethod[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEdit: (method: ShippingMethod) => void;
  onDelete: (method: ShippingMethod) => void;
}

export function ShippingTable({
  methods,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}: ShippingTableProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (methods.length === 0) {
    return (
      <EmptyState
        title="No hay métodos de envío"
        description="Crea tu primer método de envío para comenzar."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Costo base</TableHead>
            <TableHead>Umbral gratis</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {methods.map((method) => {
            const typeConfig = SHIPPING_TYPE_LABELS[method.type] ?? { label: method.type, className: '' };
            return (
              <TableRow key={method.id}>
                <TableCell className="font-medium">{method.name}</TableCell>
                <TableCell>
                  <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
                </TableCell>
                <TableCell>{formatARS(method.baseCost)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {method.freeThreshold != null ? formatARS(method.freeThreshold) : '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={method.isActive ? 'active' : 'inactive'} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(method)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(method)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
