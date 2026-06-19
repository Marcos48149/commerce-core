'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { OrderCancelDialog } from './order-cancel-dialog';
import { OrderRefundDialog } from './order-refund-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import {
  useConfirmOrder,
  useCancelOrder,
  useRefundOrder,
  type OrderDetail,
} from '@/hooks/use-orders';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, Truck, PackageCheck, RotateCcw } from 'lucide-react';

interface OrderActionsProps {
  order: OrderDetail;
}

interface ActionConfig {
  label: string;
  icon: typeof Check;
  variant: 'default' | 'destructive' | 'outline';
  action: 'confirm' | 'cancel' | 'ship' | 'deliver' | 'refund';
  disabled?: boolean;
  disabledReason?: string;
}

function getActions(status: string): ActionConfig[] {
  switch (status) {
    case 'PENDING_PAYMENT':
    case 'PAID':
      return [
        {
          label: 'Confirmar Pedido',
          icon: Check,
          variant: 'default',
          action: 'confirm',
        },
        {
          label: 'Cancelar Pedido',
          icon: X,
          variant: 'destructive',
          action: 'cancel',
        },
      ];
    case 'PROCESSING':
      return [
        {
          label: 'Enviar Pedido',
          icon: Truck,
          variant: 'default',
          action: 'ship',
        },
        {
          label: 'Cancelar Pedido',
          icon: X,
          variant: 'destructive',
          action: 'cancel',
        },
      ];
    case 'SHIPPED':
      return [
        {
          label: 'Marcar como Entregado',
          icon: PackageCheck,
          variant: 'default',
          action: 'deliver',
        },
      ];
    case 'DELIVERED':
      return [
        {
          label: 'Reembolsar',
          icon: RotateCcw,
          variant: 'outline',
          action: 'refund',
        },
      ];
    default:
      return [];
  }
}

export function OrderActions({ order }: OrderActionsProps) {
  const queryClient = useQueryClient();
  const confirmMutation = useConfirmOrder();
  const cancelMutation = useCancelOrder();
  const refundMutation = useRefundOrder();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);

  const actions = getActions(order.status);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['orders', order.id] });
  };

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(order.id);
      toast.success('Pedido confirmado correctamente');
      invalidate();
    } catch {
      toast.error('Error al confirmar el pedido');
    }
    setConfirmOpen(false);
  };

  const handleCancel = async (reason: string) => {
    try {
      await cancelMutation.mutateAsync({ id: order.id, reason });
      toast.success('Pedido cancelado correctamente');
      invalidate();
    } catch {
      toast.error('Error al cancelar el pedido');
    }
    setCancelOpen(false);
  };

  const handleShip = async () => {
    try {
      await confirmMutation.mutateAsync(order.id);
      toast.success('Pedido enviado correctamente');
      invalidate();
    } catch {
      toast.error('Error al enviar el pedido');
    }
    setShipOpen(false);
  };

  const handleDeliver = async () => {
    try {
      await confirmMutation.mutateAsync(order.id);
      toast.success('Pedido marcado como entregado');
      invalidate();
    } catch {
      toast.error('Error al marcar como entregado');
    }
    setDeliverOpen(false);
  };

  const handleRefund = async (amount: number) => {
    try {
      await refundMutation.mutateAsync({ id: order.id, amount });
      toast.success('Reembolso procesado correctamente');
      invalidate();
    } catch {
      toast.error('Error al procesar el reembolso');
    }
    setRefundOpen(false);
  };

  const isPending =
    confirmMutation.isPending ||
    cancelMutation.isPending ||
    refundMutation.isPending;

  if (actions.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const button = (
            <Button
              key={action.action}
              variant={action.variant}
              disabled={action.disabled || isPending}
              onClick={() => {
                switch (action.action) {
                  case 'confirm':
                    setConfirmOpen(true);
                    break;
                  case 'cancel':
                    setCancelOpen(true);
                    break;
                  case 'ship':
                    setShipOpen(true);
                    break;
                  case 'deliver':
                    setDeliverOpen(true);
                    break;
                  case 'refund':
                    setRefundOpen(true);
                    break;
                }
              }}
            >
              <Icon className="h-4 w-4 mr-1" />
              {action.label}
            </Button>
          );

          if (action.disabled && action.disabledReason) {
            return (
              <Tooltip key={action.action}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent>{action.disabledReason}</TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}

        <OrderCancelDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onConfirm={handleCancel}
          loading={cancelMutation.isPending}
        />

        <OrderRefundDialog
          open={refundOpen}
          onOpenChange={setRefundOpen}
          onConfirm={handleRefund}
          maxAmount={order.total}
          loading={refundMutation.isPending}
        />

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirmar Pedido"
          description="¿Estás seguro de que deseas confirmar este pedido?"
          confirmLabel="Confirmar"
          variant="default"
          onConfirm={handleConfirm}
          loading={confirmMutation.isPending}
        />

        <ConfirmDialog
          open={shipOpen}
          onOpenChange={setShipOpen}
          title="Enviar Pedido"
          description="¿Estás seguro de que deseas marcar este pedido como enviado?"
          confirmLabel="Enviar"
          variant="default"
          onConfirm={handleShip}
          loading={confirmMutation.isPending}
        />

        <ConfirmDialog
          open={deliverOpen}
          onOpenChange={setDeliverOpen}
          title="Marcar como Entregado"
          description="¿Estás seguro de que deseas marcar este pedido como entregado?"
          confirmLabel="Entregado"
          variant="default"
          onConfirm={handleDeliver}
          loading={confirmMutation.isPending}
        />
      </div>
    </TooltipProvider>
  );
}
