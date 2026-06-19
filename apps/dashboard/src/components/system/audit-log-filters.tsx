'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Search } from 'lucide-react';

const ACTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'create', label: 'Crear' },
  { value: 'update', label: 'Actualizar' },
  { value: 'delete', label: 'Eliminar' },
  { value: 'login', label: 'Inicio de sesión' },
];

const ENTITY_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'product', label: 'Producto' },
  { value: 'order', label: 'Pedido' },
  { value: 'customer', label: 'Cliente' },
  { value: 'promotion', label: 'Promoción' },
  { value: 'category', label: 'Categoría' },
  { value: 'collection', label: 'Colección' },
  { value: 'role', label: 'Rol' },
  { value: 'admin', label: 'Admin' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'shipping', label: 'Envío' },
  { value: 'store', label: 'Tienda' },
];

interface AuditLogFiltersProps {
  action: string;
  adminEmail: string;
  entityType: string;
  startDate: string;
  endDate: string;
  onActionChange: (value: string) => void;
  onAdminEmailChange: (value: string) => void;
  onEntityTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

export function AuditLogFilters({
  action,
  adminEmail,
  entityType,
  startDate,
  endDate,
  onActionChange,
  onAdminEmailChange,
  onEntityTypeChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: AuditLogFiltersProps) {
  const hasFilters = action || adminEmail || entityType || startDate || endDate;

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtros</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Acción</Label>
          <Select value={action} onValueChange={onActionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por acción" />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Admin</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={adminEmail}
              onChange={(e) => onAdminEmailChange(e.target.value)}
              placeholder="Buscar por email..."
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tipo de entidad</Label>
          <Select value={entityType} onValueChange={onEntityTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Rango de fechas</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-9 text-sm"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
