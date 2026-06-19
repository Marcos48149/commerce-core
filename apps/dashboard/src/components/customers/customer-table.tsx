'use client';

import { DataTable, type Column } from '@/components/shared/data-table';
import type { Customer } from '@/hooks/use-customers';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  loading,
  error,
  onRetry,
  onView,
}: CustomerTableProps) {
  const columns: Column<Customer>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (c) => (
        <span className="text-sm font-medium">{c.email}</span>
      ),
    },
    {
      key: 'displayName',
      header: 'Nombre',
      render: (c) => c.displayName ?? '—',
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (c) => c.phone ?? '—',
    },
    {
      key: 'totalOrders',
      header: 'Pedidos',
      render: (c) => `${c.totalOrders}`,
      className: 'text-center',
    },
    {
      key: 'createdAt',
      header: 'Registrado',
      render: (c) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(c.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      loading={loading}
      error={error}
      onRetry={onRetry}
      keyExtractor={(c) => c.id}
      onRowClick={onView}
    />
  );
}
