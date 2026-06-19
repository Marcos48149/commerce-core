'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { ShippingTable } from '@/components/system/shipping-table';
import { ShippingForm } from '@/components/system/shipping-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useShippingMethods, useDeleteShippingMethod, type ShippingMethod } from '@/hooks/use-shipping';
import { toast } from 'sonner';

export default function ShippingPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShippingMethod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShippingMethod | null>(null);
  const { data: methods, isLoading, isError, refetch } = useShippingMethods();
  const deleteMutation = useDeleteShippingMethod();

  const handleEdit = useCallback((method: ShippingMethod) => {
    setEditTarget(method);
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
      toast.success('Método de envío eliminado correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar el método de envío');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Métodos de Envío"
        description="Gestiona los métodos de envío disponibles."
        actionLabel="Nuevo Método"
        onAction={handleCreate}
      />

      <ShippingTable
        methods={methods ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los métodos de envío' : null}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <ShippingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editId={editTarget?.id ?? null}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar Método de Envío"
        description={
          deleteTarget
            ? `¿Eliminar método de envío ${deleteTarget.name}?`
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
