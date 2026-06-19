'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { StoreTable } from '@/components/tenant/store-table';
import { StoreForm } from '@/components/tenant/store-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useStores, useDeleteStore, type Store } from '@/hooks/use-stores';
import { toast } from 'sonner';

export default function StoresPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Store | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const { data: stores, isLoading, isError, refetch } = useStores(search);
  const deleteMutation = useDeleteStore();

  const handleEdit = useCallback((store: Store) => {
    setEditTarget(store);
    setFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditTarget(null);
    setFormOpen(true);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Tienda eliminada correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar la tienda');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tiendas"
        description="Gestiona las tiendas del tenant."
        actionLabel="Nueva Tienda"
        onAction={handleCreate}
      />

      <StoreTable
        stores={stores ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar las tiendas' : null}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <StoreForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editId={editTarget?.id ?? null}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar Tienda"
        description={
          deleteTarget
            ? `¿Estás seguro de que deseas eliminar la tienda "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
