'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useCreateShippingMethod, useUpdateShippingMethod, useShippingMethod } from '@/hooks/use-shipping';
import { toast } from 'sonner';

const shippingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['flat', 'weight', 'free']),
  baseCost: z.string().min(1, 'El costo base es requerido'),
  freeThreshold: z.string().optional().default(''),
  isActive: z.boolean().default(true),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
}

export function ShippingForm({ open, onOpenChange, editId }: ShippingFormProps) {
  const createMutation = useCreateShippingMethod();
  const updateMutation = useUpdateShippingMethod(editId ?? '');
  const { data: method, isLoading: methodLoading } = useShippingMethod(editId ?? '');

  const isEditing = !!editId;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema) as any,
    defaultValues: { name: '', type: 'flat', baseCost: '' as any, freeThreshold: '' as any, isActive: true },
  });

  useEffect(() => {
    if (isEditing && method) {
      reset({
        name: method.name,
        type: method.type,
        baseCost: method.baseCost.toString() as any,
        freeThreshold: method.freeThreshold?.toString() as any ?? '' as any,
        isActive: method.isActive ?? true,
      });
    } else if (!isEditing) {
      reset({ name: '', type: 'flat', baseCost: '' as any, freeThreshold: '' as any, isActive: true });
    }
  }, [method, isEditing, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: ShippingFormValues) {
    try {
      const payload = {
        name: data.name,
        type: data.type,
        baseCost: parseFloat(data.baseCost),
        freeThreshold: data.freeThreshold ? parseFloat(data.freeThreshold) : null,
        isActive: data.isActive,
      };
      if (isEditing && editId) {
        await updateMutation.mutateAsync(payload);
        toast.success('Método de envío actualizado correctamente');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Método de envío creado correctamente');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Error al actualizar el método de envío' : 'Error al crear el método de envío');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Método de Envío' : 'Nuevo Método de Envío'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del método de envío.'
              : 'Completa los datos para crear un nuevo método de envío.'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && methodLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input id="name" {...field} placeholder="Ej: Envío estándar" />
                  )}
                />
                {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Tarifa fija</SelectItem>
                          <SelectItem value="weight">Por peso</SelectItem>
                          <SelectItem value="free">Gratis</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <FormMessage>{errors.type.message}</FormMessage>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseCost">Costo base (ARS)</Label>
                  <Controller
                    control={control}
                    name="baseCost"
                    render={({ field }) => (
                      <Input id="baseCost" {...field} type="number" step="0.01" min="0" placeholder="1500" />
                    )}
                  />
                  {errors.baseCost && <FormMessage>{errors.baseCost.message}</FormMessage>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeThreshold">Umbral de envío gratis (ARS)</Label>
                <Controller
                  control={control}
                  name="freeThreshold"
                  render={({ field }) => (
                    <Input id="freeThreshold" {...field} type="number" step="0.01" min="0" placeholder="Opcional" />
                  )}
                />
                {errors.freeThreshold && <FormMessage>{errors.freeThreshold.message}</FormMessage>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <>
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="isActive" className="cursor-pointer">
                        Método activo
                      </Label>
                    </>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Método'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
