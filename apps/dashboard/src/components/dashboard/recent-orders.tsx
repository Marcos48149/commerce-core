'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import type { RecentOrder } from '@/hooks/use-dashboard';

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  PROCESSING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  REFUNDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string): string {
  return `#${id.slice(0, 8)}`;
}

interface RecentOrdersProps {
  orders: RecentOrder[] | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export function RecentOrders({ orders, loading, error, onRetry }: RecentOrdersProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Error al cargar pedidos recientes" onRetry={onRetry} />;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Pedidos Recientes</h3>
      {!orders || orders.length === 0 ? (
        <EmptyState
          title="No hay pedidos recientes"
          description="Aún no se han realizado pedidos en tu tienda."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {truncateId(order.id)}
                  </TableCell>
                  <TableCell>{order.customerName ?? '—'}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge
                      className={statusColors[order.status] ?? ''}
                      variant="outline"
                    >
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
