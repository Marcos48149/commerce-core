'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { getPromotionStatus, type Promotion } from '@/hooks/use-promotions';

interface PromotionTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  active: { label: 'Activa', variant: 'success' },
  scheduled: { label: 'Programada', variant: 'warning' },
  expired: { label: 'Expirada', variant: 'destructive' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR');
}

export function PromotionTable({ promotions, onEdit, onDelete }: PromotionTableProps) {
  if (promotions.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-sm text-muted-foreground">
          No se encontraron promociones
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left text-sm font-medium p-3">Nombre</th>
            <th className="text-left text-sm font-medium p-3">Tipo</th>
            <th className="text-left text-sm font-medium p-3">Estado</th>
            <th className="text-left text-sm font-medium p-3">Usos</th>
            <th className="text-left text-sm font-medium p-3">Inicio</th>
            <th className="text-left text-sm font-medium p-3">Fin</th>
            <th className="text-right text-sm font-medium p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promo) => {
            const status = getPromotionStatus(promo);
            const cfg = statusConfig[status] ?? { label: status, variant: 'secondary' as const };

            return (
              <tr key={promo.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 text-sm font-medium">{promo.name}</td>
                <td className="p-3 text-sm">
                  <Badge variant={promo.type === 'percentage' ? 'info' : 'secondary'}>
                    {promo.type === 'percentage' ? 'Porcentaje' : 'Fijo'}
                  </Badge>
                </td>
                <td className="p-3 text-sm">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {promo.usageCount} / {promo.usageLimit ?? '∞'}
                </td>
                <td className="p-3 text-sm text-muted-foreground">{formatDate(promo.startDate)}</td>
                <td className="p-3 text-sm text-muted-foreground">{formatDate(promo.endDate)}</td>
                <td className="p-3 text-sm text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(promo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(promo)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
