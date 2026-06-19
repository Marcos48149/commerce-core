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
import { Badge } from '@/components/ui/badge';
import { useCreatePlan, useUpdatePlan, usePlan } from '@/hooks/use-plans';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const planSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  maxStores: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  maxAdmins: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  maxProducts: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  monthlyPrice: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  features: z.array(z.string()).default([]),
});

type PlanFormValues = z.infer<typeof planSchema>;

const AVAILABLE_FEATURES = [
  { value: 'webhooks', label: 'Webhooks' },
  { value: 'api', label: 'API' },
  { value: 'multilingual', label: 'Multilingual' },
  { value: 'custom-domain', label: 'Custom Domain' },
];

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
}

export function PlanForm({ open, onOpenChange, editId }: PlanFormProps) {
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan(editId ?? '');
  const { data: plan, isLoading: planLoading } = usePlan(editId ?? '');

  const isEditing = !!editId;

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: { name: '', maxStores: 0, maxAdmins: 0, maxProducts: 0, monthlyPrice: 0, features: [] },
  });

  const selectedFeatures = watch('features');

  useEffect(() => {
    if (isEditing && plan) {
      reset({
        name: plan.name,
        maxStores: plan.maxStores,
        maxAdmins: plan.maxAdmins,
        maxProducts: plan.maxProducts,
        monthlyPrice: plan.monthlyPrice,
        features: plan.features ?? [],
      });
    } else if (!isEditing) {
      reset({ name: '', maxStores: 0, maxAdmins: 0, maxProducts: 0, monthlyPrice: 0, features: [] });
    }
  }, [plan, isEditing, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  function toggleFeature(feature: string) {
    if (selectedFeatures.includes(feature)) {
      setValue('features', selectedFeatures.filter((f) => f !== feature));
    } else {
      setValue('features', [...selectedFeatures, feature]);
    }
  }

  async function onSubmit(data: PlanFormValues) {
    try {
      if (isEditing && editId) {
        await updateMutation.mutateAsync(data);
        toast.success('Plan actualizado correctamente');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Plan creado correctamente');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Error al actualizar el plan' : 'Error al crear el plan');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del plan.' : 'Completa los datos para crear un nuevo plan.'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && planLoading ? (
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
                    <Input id="name" {...field} placeholder="Nombre del plan" />
                  )}
                />
                {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxStores">Máx. Tiendas</Label>
                  <Controller
                    control={control}
                    name="maxStores"
                    render={({ field }) => (
                      <Input id="maxStores" type="number" min={0} {...field} />
                    )}
                  />
                  {errors.maxStores && <FormMessage>{errors.maxStores.message}</FormMessage>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAdmins">Máx. Admins</Label>
                  <Controller
                    control={control}
                    name="maxAdmins"
                    render={({ field }) => (
                      <Input id="maxAdmins" type="number" min={0} {...field} />
                    )}
                  />
                  {errors.maxAdmins && <FormMessage>{errors.maxAdmins.message}</FormMessage>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxProducts">Máx. Productos</Label>
                  <Controller
                    control={control}
                    name="maxProducts"
                    render={({ field }) => (
                      <Input id="maxProducts" type="number" min={0} {...field} />
                    )}
                  />
                  {errors.maxProducts && <FormMessage>{errors.maxProducts.message}</FormMessage>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Precio Mensual (ARS)</Label>
                <Controller
                  control={control}
                  name="monthlyPrice"
                  render={({ field }) => (
                    <Input
                      id="monthlyPrice"
                      type="number"
                      step="0.01"
                      min={0}
                      {...field}
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.monthlyPrice && <FormMessage>{errors.monthlyPrice.message}</FormMessage>}
              </div>

              <div className="space-y-2">
                <Label>Funcionalidades</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_FEATURES.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature.value);
                    return (
                      <button
                        key={feature.value}
                        type="button"
                        onClick={() => toggleFeature(feature.value)}
                      >
                        <Badge
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer transition-colors"
                        >
                          {feature.label}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Plan'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
