'use client';

import { DataTable, type Column } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/hooks/use-categories';

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({
  categories,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (cat) => <span className="font-medium">{cat.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (cat) => <span className="text-muted-foreground">{cat.slug}</span>,
    },
    {
      key: 'parent',
      header: 'Categoría Padre',
      render: (cat) => cat.parent?.name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'productCount',
      header: 'Productos',
      sortable: true,
      render: (cat) => cat.productCount,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (cat) => <StatusBadge status={cat.status} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (cat) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(cat)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(cat)} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Category>
      columns={columns}
      data={categories}
      loading={loading}
      error={error}
      onRetry={onRetry}
      keyExtractor={(cat) => cat.id}
      pageSize={50}
    />
  );
}
