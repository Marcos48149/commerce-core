'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { RoleTable } from '@/components/iam/role-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useRoles, useDeleteRole, type Role } from '@/hooks/use-roles';
import { toast } from 'sonner';

export default function RolesPage() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const { data: roles, isLoading, isError, refetch } = useRoles();
  const deleteMutation = useDeleteRole();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Rol eliminado correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar el rol');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Gestiona los roles y permisos del sistema"
        actionLabel="Nuevo Rol"
        onAction={() => router.push('/iam/roles/new')}
      />

      <RoleTable
        roles={roles ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los roles' : null}
        onRetry={() => refetch()}
        onDelete={setDeleteTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar Rol"
        description={
          deleteTarget
            ? `¿Estás seguro de que deseas eliminar el rol "${deleteTarget.name}"? Esta acción no se puede deshacer.`
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
