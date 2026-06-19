'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { WebhookTable } from '@/components/system/webhook-table';
import { WebhookForm } from '@/components/system/webhook-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useWebhooks, useDeleteWebhook, type Webhook } from '@/hooks/use-webhooks';
import { toast } from 'sonner';

export default function WebhooksPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Webhook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null);
  const { data: webhooks, isLoading, isError, refetch } = useWebhooks();
  const deleteMutation = useDeleteWebhook();

  const handleEdit = useCallback((webhook: Webhook) => {
    setEditTarget(webhook);
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
      toast.success('Webhook eliminado correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar el webhook');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Gestiona los webhooks para recibir eventos del sistema."
        actionLabel="Nuevo Webhook"
        onAction={handleCreate}
      />

      <WebhookTable
        webhooks={webhooks ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los webhooks' : null}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <WebhookForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editId={editTarget?.id ?? null}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar Webhook"
        description={
          deleteTarget
            ? `¿Eliminar webhook ${deleteTarget.name}? Las entregas pendientes no se completarán.`
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
