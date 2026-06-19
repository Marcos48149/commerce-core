'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CouponManager } from '@/components/promotions/coupon-manager';
import { usePromotion, getPromotionStatus } from '@/hooks/use-promotions';
import { ArrowLeft, Pencil } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Activa', variant: 'success' },
  scheduled: { label: 'Programada', variant: 'warning' },
  expired: { label: 'Expirada', variant: 'destructive' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR');
}

export default function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: promotion, isLoading } = usePromotion(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Promoción no encontrada</p>
      </div>
    );
  }

  const status = getPromotionStatus(promotion);
  const cfg = statusConfig[status] ?? { label: status, variant: 'destructive' as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/promotions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{promotion.name}</h1>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {promotion.description ?? 'Sin descripción'}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/promotions/${id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {promotion.type === 'percentage' ? 'Porcentaje' : 'Fijo'}
            </p>
            <p className="text-2xl font-bold mt-1">
              {promotion.type === 'percentage'
                ? `${promotion.value}%`
                : `$${promotion.value.toFixed(2)}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vigencia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Desde: <span className="font-medium">{formatDate(promotion.startDate)}</span>
            </p>
            <p className="text-sm mt-1">
              Hasta: <span className="font-medium">{formatDate(promotion.endDate)}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {promotion.usageCount} / {promotion.usageLimit ?? '∞'}
            </p>
            {promotion.minPurchaseAmount && (
              <p className="text-sm text-muted-foreground mt-1">
                Mínimo: ${promotion.minPurchaseAmount.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cupones</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponManager promotionId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
