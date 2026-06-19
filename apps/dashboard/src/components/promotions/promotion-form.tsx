'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useCreatePromotion, useUpdatePromotion, type Promotion } from '@/hooks/use-promotions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const promotionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, 'El valor debe ser mayor a 0'),
  minPurchaseAmount: z.coerce.number().min(0).optional(),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  promotion?: Promotion | null;
  onSuccess?: () => void;
}

export function PromotionForm({ promotion, onSuccess }: PromotionFormProps) {
  const router = useRouter();
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion(promotion?.id ?? '');

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minPurchaseAmount: undefined,
      startDate: '',
      endDate: '',
      usageLimit: undefined,
    },
  });

  useEffect(() => {
    if (promotion) {
      form.reset({
        name: promotion.name,
        description: promotion.description ?? '',
        type: promotion.type,
        value: promotion.value,
        minPurchaseAmount: promotion.minPurchaseAmount ?? undefined,
        startDate: promotion.startDate ? promotion.startDate.slice(0, 10) : '',
        endDate: promotion.endDate ? promotion.endDate.slice(0, 10) : '',
        usageLimit: promotion.usageLimit ?? undefined,
      });
    }
  }, [promotion, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: PromotionFormValues) {
    const payload: Record<string, unknown> = {
      name: data.name,
      description: data.description || null,
      type: data.type,
      value: data.value,
      minPurchaseAmount: data.minPurchaseAmount || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      usageLimit: data.usageLimit || null,
    };

    try {
      if (promotion) {
        await updateMutation.mutateAsync(payload);
        toast.success('Promoción actualizada correctamente');
        router.push('/promotions');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Promoción creada correctamente');
        router.push('/promotions');
      }
      onSuccess?.();
    } catch {
      toast.error('Ocurrió un error al guardar la promoción');
    }
  }

  const isEdit = !!promotion;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre de la promoción" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Descripción opcional" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="percentage"
                      checked={field.value === 'percentage'}
                      onChange={() => field.onChange('percentage')}
                      disabled={isEdit}
                      className="h-4 w-4"
                    />
                    Porcentaje
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="fixed"
                      checked={field.value === 'fixed'}
                      onChange={() => field.onChange('fixed')}
                      disabled={isEdit}
                      className="h-4 w-4"
                    />
                    Fijo
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minPurchaseAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto mínimo de compra</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Opcional"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de inicio</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de fin</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || '')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="usageLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Límite de usos</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Sin límite"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
