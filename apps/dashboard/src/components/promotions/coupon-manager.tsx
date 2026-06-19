'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { GenerateCouponsDialog } from './generate-coupons-dialog';
import { usePromotionCoupons, useCreateCoupon, useDeleteCoupon, type Coupon } from '@/hooks/use-promotions';
import { toast } from 'sonner';
import { Loader2, Trash2, Plus, Wand2 } from 'lucide-react';

interface CouponManagerProps {
  promotionId: string;
}

export function CouponManager({ promotionId }: CouponManagerProps) {
  const { data: coupons, isLoading, refetch } = usePromotionCoupons(promotionId);
  const createMutation = useCreateCoupon(promotionId);
  const deleteMutation = useDeleteCoupon(promotionId);

  const [manualCode, setManualCode] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);

  const handleCreateManual = async () => {
    const code = manualCode.trim();
    if (!code) return;
    try {
      await createMutation.mutateAsync({ code });
      toast.success('Cupón creado correctamente');
      setManualCode('');
    } catch {
      toast.error('Error al crear el cupón');
    }
  };

  const handleBatchGenerate = async (quantity: number, prefix?: string) => {
    try {
      await createMutation.mutateAsync({ quantity, prefix });
      toast.success(`${quantity} cupones generados correctamente`);
      setGenerateOpen(false);
    } catch {
      toast.error('Error al generar cupones');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Cupón eliminado correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar el cupón');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cupones</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setGenerateOpen(true)}>
            <Wand2 className="h-4 w-4 mr-2" />
            Generar Cupones
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Código manual"
          className="max-w-xs"
        />
        <Button
          size="sm"
          onClick={handleCreateManual}
          disabled={!manualCode.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span className="ml-2">Agregar</span>
        </Button>
      </div>

      {coupons && coupons.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium p-3">Código</th>
                <th className="text-left text-sm font-medium p-3">Usos</th>
                <th className="text-left text-sm font-medium p-3">Estado</th>
                <th className="text-right text-sm font-medium p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-sm font-mono font-medium">{coupon.code}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {coupon.usageCount} / {coupon.maxUsage ?? '∞'}
                  </td>
                  <td className="p-3 text-sm">
                    <Badge variant={coupon.isActive ? 'success' : 'destructive'}>
                      {coupon.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(coupon)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          No hay cupones para esta promoción
        </div>
      )}

      <GenerateCouponsDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerate={handleBatchGenerate}
        loading={createMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="¿Eliminar cupón?"
        description={
          deleteTarget
            ? `¿Estás seguro de que deseas eliminar el cupón "${deleteTarget.code}"?`
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
