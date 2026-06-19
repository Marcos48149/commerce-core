'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { PlanTable } from '@/components/tenant/plan-table';
import { PlanForm } from '@/components/tenant/plan-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { usePlans, useDeletePlan, type Plan } from '@/hooks/use-plans';
import { toast } from 'sonner';

export default function PlansPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const { data: plans, isLoading, isError, refetch } = usePlans();
  const deleteMutation = useDeletePlan();

  const handleEdit = useCallback((plan: Plan) => {
    setEditTarget(plan);
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
      toast.success('Plan eliminado correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar el plan');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planes"
        description="Gestiona los planes de suscripción."
        actionLabel="Nuevo Plan"
        onAction={handleCreate}
      />

      <PlanTable
        plans={plans ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los planes' : null}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <PlanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editId={editTarget?.id ?? null}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar Plan"
        description={
          deleteTarget
            ? `¿Estás seguro de que deseas eliminar el plan "${deleteTarget.name}"? Esta acción no se puede deshacer.`
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
