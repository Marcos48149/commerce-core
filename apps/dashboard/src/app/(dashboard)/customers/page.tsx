'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';
import { CustomerTable } from '@/components/customers/customer-table';
import { useCustomers, type Customer } from '@/hooks/use-customers';
import { Label } from '@/components/ui/label';

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get('search') ?? '',
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

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

  const { data, isLoading, isError, refetch } = useCustomers({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  });

  const handleView = (customer: Customer) => {
    router.push(`/dashboard/customers/${customer.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gestiona los clientes de tu tienda"
      />

      <div className="flex items-end gap-4">
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
            placeholder="Buscar por email o nombre..."
          />
        </div>
      </div>

      <CustomerTable
        customers={data?.data ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los clientes' : null}
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
