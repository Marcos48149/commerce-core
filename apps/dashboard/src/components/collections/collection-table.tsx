'use client';

import { DataTable, type Column } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Pencil, Trash2, ImageOff } from 'lucide-react';
import type { Collection } from '@/hooks/use-collections';

interface CollectionTableProps {
  collections: Collection[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

export function CollectionTable({
  collections,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}: CollectionTableProps) {
  const columns: Column<Collection>[] = [
    {
      key: 'image',
      header: 'Imagen',
      render: (col) =>
        col.image ? (
          <img src={col.image} alt={col.name} className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
            <ImageOff className="h-5 w-5 text-muted-foreground" />
          </div>
        ),
    },
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (col) => <span className="font-medium">{col.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (col) => <span className="text-muted-foreground">{col.slug}</span>,
    },
    {
      key: 'productCount',
      header: 'Productos',
      sortable: true,
      render: (col) => col.productCount,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (col) => <StatusBadge status={col.status} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (col) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(col)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(col)} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Collection>
      columns={columns}
      data={collections}
      loading={loading}
      error={error}
      onRetry={onRetry}
      keyExtractor={(col) => col.id}
      pageSize={50}
    />
  );
}
