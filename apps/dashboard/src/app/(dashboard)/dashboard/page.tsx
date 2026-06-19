'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { useDashboardSummary, useRecentOrders } from '@/hooks/use-dashboard';
import { Plus, ListOrdered, Users } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const summaryQuery = useDashboardSummary();
  const ordersQuery = useRecentOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general de tu tienda"
      />

      <StatsGrid
        data={summaryQuery.data}
        loading={summaryQuery.isLoading}
        error={summaryQuery.isError}
        onRetry={() => summaryQuery.refetch()}
      />

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push('/dashboard/catalog/products/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Producto
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/orders')}>
            <ListOrdered className="mr-2 h-4 w-4" />
            Ver Pedidos
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/customers')}>
            <Users className="mr-2 h-4 w-4" />
            Ver Clientes
          </Button>
        </div>
      </div>

      <Separator />

      <RecentOrders
        orders={ordersQuery.data}
        loading={ordersQuery.isLoading}
        error={ordersQuery.isError}
        onRetry={() => ordersQuery.refetch()}
      />
    </div>
  );
}
