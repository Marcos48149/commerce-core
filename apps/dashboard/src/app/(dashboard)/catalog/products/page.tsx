'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';
import { ProductTable } from '@/components/products/product-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useProducts, useDeleteProduct, type Product } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: categoriesList } = useCategories();

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

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteProduct();

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Producto eliminado correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de productos"
        actionLabel="Nuevo Producto"
        onAction={() => router.push('/dashboard/catalog/products/new')}
      />

      <div className="flex items-center gap-4">
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
            placeholder="Buscar por nombre..."
          />
        </div>
        <div className="w-56">
          <Select
            value={categoryId}
            onValueChange={(v) => {
              setCategoryId(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categoriesList?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ProductTable
        products={data?.data ?? []}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
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
        title="¿Eliminar producto?"
        description={
          deleteTarget
            ? `¿Estás seguro de que deseas eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`
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
