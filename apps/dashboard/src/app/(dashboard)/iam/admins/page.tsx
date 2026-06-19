'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';
import { AdminTable } from '@/components/iam/admin-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAdmins, useDeleteAdmin, type Admin } from '@/hooks/use-admins';
import { toast } from 'sonner';

export default function AdminsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);

  const debounceTimer = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (value: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setDebouncedSearch(value);
          setPage(1);
        }, 400);
      };
    })(),
    [],
  );

  const { data, isLoading, isError, refetch } = useAdmins({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteAdmin();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Administrador eliminado correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar el administrador');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administradores"
        description="Gestiona los administradores del sistema"
        actionLabel="Nuevo Administrador"
        onAction={() => router.push('/iam/admins/new')}
      />

      <div className="w-72">
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            debounceTimer(e.target.value);
          }}
          onClear={() => {
            setSearch('');
            setDebouncedSearch('');
            setPage(1);
          }}
          placeholder="Buscar por email..."
        />
      </div>

      <AdminTable
        admins={data?.data ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los administradores' : null}
        onRetry={() => refetch()}
        onDelete={setDeleteTarget}
      />

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar Administrador"
        description={
          deleteTarget
            ? `¿Eliminar administrador ${deleteTarget.displayName}? Esta acción es reversible (soft-delete).`
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
