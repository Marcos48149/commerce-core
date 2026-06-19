'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';
import { OrderTable } from '@/components/orders/order-table';
import { useOrders, type Order } from '@/hooks/use-orders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const { data, isLoading, isError, refetch } = useOrders({
    page,
    limit: 20,
    status: status || undefined,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy,
    sortOrder,
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleView = (order: Order) => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gestiona los pedidos de tu tienda"
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-72">
          <Label className="mb-1 block text-sm">Buscar</Label>
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
            placeholder="Buscar por ID o email..."
          />
        </div>
        <div className="w-44">
          <Label className="mb-1 block text-sm">Estado</Label>
          <Select value={status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="shipped">Enviado</SelectItem>
              <SelectItem value="delivered">Entregado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Label className="mb-1 block text-sm">Desde</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-44">
          <Label className="mb-1 block text-sm">Hasta</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <OrderTable
        orders={data?.data ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los pedidos' : null}
        onRetry={() => refetch()}
        onView={handleView}
      />

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
