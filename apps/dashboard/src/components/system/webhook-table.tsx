'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Pencil, Trash2 } from 'lucide-react';
import type { Webhook } from '@/hooks/use-webhooks';

const WEBHOOK_EVENT_LABELS: Record<string, string> = {
  order_created: 'Pedido creado',
  order_paid: 'Pedido pagado',
  order_cancelled: 'Pedido cancelado',
  order_updated: 'Pedido actualizado',
  inventory_updated: 'Inventario actualizado',
  customer_created: 'Cliente creado',
};

interface WebhookTableProps {
  webhooks: Webhook[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEdit: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
}

export function WebhookTable({
  webhooks,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}: WebhookTableProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (webhooks.length === 0) {
    return (
      <EmptyState
        title="No hay webhooks"
        description="Crea tu primer webhook para comenzar a recibir eventos."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Eventos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Último disparo</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks.map((webhook) => (
            <TableRow key={webhook.id}>
              <TableCell className="font-medium">{webhook.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={webhook.url}>
                {webhook.url}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {WEBHOOK_EVENT_LABELS[event] ?? event}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={webhook.isActive ? 'active' : 'inactive'} />
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {webhook.lastTriggeredAt
                  ? new Date(webhook.lastTriggeredAt).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Nunca'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(webhook)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(webhook)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
