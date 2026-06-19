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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useCreateStore, useUpdateStore, useStore } from '@/hooks/use-stores';
import { usePlans } from '@/hooks/use-plans';
import { toast } from 'sonner';

const storeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  currency: z.string().min(1, 'La moneda es requerida'),
  planId: z.string().min(1, 'El plan es requerido'),
  isActive: z.boolean().default(true),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface StoreFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
}

export function StoreForm({ open, onOpenChange, editId }: StoreFormProps) {
  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore(editId ?? '');
  const { data: store, isLoading: storeLoading } = useStore(editId ?? '');
  const { data: plans, isLoading: plansLoading } = usePlans();

  const isEditing = !!editId;

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema) as any,
    defaultValues: { name: '', slug: '', currency: '', planId: '', isActive: true },
  });

  const watchedName = watch('name');

  useEffect(() => {
    if (isEditing && store) {
      reset({
        name: store.name,
        slug: store.slug,
        currency: store.currency,
        planId: store.planId,
        isActive: store.isActive ?? true,
      });
    } else if (!isEditing) {
      reset({ name: '', slug: '', currency: '', planId: '', isActive: true });
    }
  }, [store, isEditing, reset]);

  useEffect(() => {
    if (!isEditing && watchedName && !watch('slug')) {
      setValue('slug', watchedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [watchedName, isEditing, setValue, watch]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const currencyOptions = ['ARS', 'USD', 'EUR', 'BRL'];
  const effectiveStore = isEditing ? store : null;

  async function onSubmit(data: StoreFormValues) {
    try {
      if (isEditing && editId) {
        await updateMutation.mutateAsync(data);
        toast.success('Tienda actualizada correctamente');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Tienda creada correctamente');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Error al actualizar la tienda' : 'Error al crear la tienda');
    }
  }

  const loading = (isEditing && storeLoading) || plansLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Tienda' : 'Nueva Tienda'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la tienda.' : 'Completa los datos para crear una nueva tienda.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {isEditing && effectiveStore && !effectiveStore.isActive && (
              <div className="flex items-start gap-3 p-3 mb-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Esta tienda está desactivada. Los clientes no pueden realizar compras.
                </p>
              </div>
            )}

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input id="name" {...field} placeholder="Nombre de la tienda" />
                    )}
                  />
                  {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Controller
                    control={control}
                    name="slug"
                    render={({ field }) => (
                      <Input id="slug" {...field} placeholder="slug-de-la-tienda" />
                    )}
                  />
                  {errors.slug && <FormMessage>{errors.slug.message}</FormMessage>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.currency && <FormMessage>{errors.currency.message}</FormMessage>}
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Controller
                    control={control}
                    name="planId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {(plans ?? []).map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.planId && <FormMessage>{errors.planId.message}</FormMessage>}
                </div>
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
                        Tienda activa
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
                {isEditing ? 'Guardar Cambios' : 'Crear Tienda'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
