'use client';

import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { Order } from '@/hooks/use-orders';

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
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

interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView: (order: Order) => void;
}

export function OrderTable({ orders, loading, error, onRetry, onView }: OrderTableProps) {
  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Pedido',
      render: (order) => (
        <span className="font-mono text-sm">{truncateId(order.id)}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Cliente',
      render: (order) => order.customerName ?? '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      render: (order) => formatARS(order.total),
    },
    {
      key: 'itemsCount',
      header: 'Artículos',
      render: (order) => `${order.itemsCount}`,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (order) => (
        <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (order) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView(order);
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      loading={loading}
      error={error}
      onRetry={onRetry}
      keyExtractor={(o) => o.id}
      onRowClick={onView}
    />
  );
}
