'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { PromotionTable } from '@/components/promotions/promotion-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePromotions, useDeletePromotion, type Promotion } from '@/hooks/use-promotions';
import { toast } from 'sonner';

export default function PromotionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const { data, isLoading, isError, refetch } = usePromotions({
    page,
    limit: 20,
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
  });

  const deleteMutation = useDeletePromotion();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Promoción eliminada correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar la promoción');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promociones"
        description="Gestiona las promociones y cupones de descuento"
        actionLabel="Nueva Promoción"
        onAction={() => router.push('/promotions/new')}
      />

      <div className="flex gap-4">
        <SearchInput
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          onClear={() => { setSearch(''); setPage(1); }}
          placeholder="Buscar por nombre..."
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => { setStatus(v); setPage(1); }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="scheduled">Programadas</SelectItem>
            <SelectItem value="expired">Expiradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PromotionTable
        promotions={data?.data ?? []}
        onEdit={(promo) => router.push(`/promotions/${promo.id}/edit`)}
        onDelete={setDeleteTarget}
      />

      {data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={
          deleteTarget
            ? `¿Eliminar promoción ${deleteTarget.name}?`
            : ''
        }
        description="También se eliminarán todos los cupones asociados."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
