'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { OrderTimeline } from './order-timeline';
import { OrderActions } from './order-actions';
import { ImageOff, MapPin, User, Mail } from 'lucide-react';
import { useOrder, type OrderDetail as OrderDetailType } from '@/hooks/use-orders';

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string): string {
  return `#${id.slice(0, 8)}`;
}

interface OrderDetailContentProps {
  order: OrderDetailType;
  onBack: () => void;
}

function OrderDetailContent({ order, onBack }: OrderDetailContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Pedido {truncateId(order.id)}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Creado el {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} className="text-sm px-3 py-1" />
      </div>

      <OrderActions order={order} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{order.customerName ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{order.customerEmail ?? '—'}</span>
            </div>
          </CardContent>
        </Card>

        {order.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.province}
              </p>
              <p>{order.shippingAddress.postalCode}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Artículos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Imagen</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Variante</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">P. Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No hay artículos en este pedido
                  </TableCell>
                </TableRow>
              ) : (
                order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <ImageOff className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.variantName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right">{formatARS(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{formatARS(item.totalPrice)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Totales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatARS(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span className="text-destructive">-{formatARS(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{order.shipping > 0 ? formatARS(order.shipping) : 'Gratis'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span>{formatARS(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatARS(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        {order.timeline && order.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Línea de Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline events={order.timeline} currentStatus={order.status} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface OrderDetailViewProps {
  orderId: string;
  onBack: () => void;
}

export function OrderDetailView({ orderId, onBack }: OrderDetailViewProps) {
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState message="Error al cargar el pedido" onRetry={() => refetch()} />;
  if (!order) return null;

  return <OrderDetailContent order={order} onBack={onBack} />;
}
