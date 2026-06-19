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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Pencil, Trash2 } from 'lucide-react';
import type { Plan } from '@/hooks/use-plans';

interface PlanTableProps {
  plans: Plan[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
}

export function PlanTable({ plans, loading, error, onRetry, onEdit, onDelete }: PlanTableProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (plans.length === 0) {
    return (
      <EmptyState
        title="No hay planes"
        description="Crea tu primer plan para comenzar."
      />
    );
  }

  const isInUse = (plan: Plan): boolean => (plan.storeCount ?? 0) > 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Máx. Tiendas</TableHead>
            <TableHead>Máx. Admins</TableHead>
            <TableHead>Máx. Productos</TableHead>
            <TableHead>Funcionalidades</TableHead>
            <TableHead>Precio Mensual</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {plan.name}
                  {isInUse(plan) && (
                    <Badge variant="info" className="text-xs">En uso</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{plan.maxStores}</TableCell>
              <TableCell>{plan.maxAdmins}</TableCell>
              <TableCell>{plan.maxProducts}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {plan.features.length > 0 ? (
                    plan.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs capitalize">
                        {feature}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatPrice(plan.monthlyPrice)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {isInUse(plan) ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button variant="ghost" size="icon" disabled className="text-destructive/40">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        No se puede eliminar un plan en uso.
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(plan)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
