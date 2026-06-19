'use client';

import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { StatsCard } from './stats-card';
import type { DashboardSummary } from '@/hooks/use-dashboard';

interface StatsGridProps {
  data: DashboardSummary | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export function StatsGrid({ data, loading, error, onRetry }: StatsGridProps) {
  const cards = [
    {
      title: 'Productos',
      value: data?.products.current ?? 0,
      trend: data?.products.trend ?? 0,
      icon: Package,
      href: '/dashboard/catalog/products',
    },
    {
      title: 'Pedidos Pendientes',
      value: data?.pendingOrders.current ?? 0,
      trend: data?.pendingOrders.trend ?? 0,
      icon: ShoppingCart,
      href: '/dashboard/orders?status=pending',
    },
    {
      title: 'Clientes',
      value: data?.customers.current ?? 0,
      trend: data?.customers.trend ?? 0,
      icon: Users,
      href: '/dashboard/customers',
    },
    {
      title: 'Ingresos del Mes',
      value: data?.monthlyRevenue.current ?? 0,
      trend: data?.monthlyRevenue.trend ?? 0,
      icon: DollarSign,
      href: '/dashboard/orders',
      isCurrency: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          trend={card.trend}
          icon={card.icon}
          href={card.href}
          isCurrency={card.isCurrency}
          loading={loading}
          error={error}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
