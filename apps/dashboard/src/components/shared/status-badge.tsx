import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'active' | 'inactive' | 'pending' | 'cancelled' | 'completed' | 'draft' | 'paid' | 'refunded' | 'shipped' | 'processing' | 'delivered';

const statusConfig: Record<StatusVariant, { variant?: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'outline'; label: string; className?: string }> = {
  active: { variant: 'success', label: 'Activo' },
  inactive: { variant: 'secondary', label: 'Inactivo' },
  pending: { variant: 'warning', label: 'Pendiente' },
  cancelled: { variant: 'destructive', label: 'Cancelado' },
  completed: { variant: 'success', label: 'Completado' },
  draft: { variant: 'outline', label: 'Borrador' },
  paid: { variant: 'info', label: 'Pagado' },
  refunded: { variant: 'warning', label: 'Reembolsado' },
  shipped: { className: 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', label: 'Enviado' },
  processing: { className: 'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100', label: 'Procesando' },
  delivered: { variant: 'success', label: 'Entregado' },
};

const orderStatusMap: Record<string, StatusVariant> = {
  PENDING_PAYMENT: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const orderVariant = orderStatusMap[status];
  const key = orderVariant ?? status.toLowerCase() as StatusVariant;
  const config = statusConfig[key] ?? { variant: 'outline' as const, label: status };

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
