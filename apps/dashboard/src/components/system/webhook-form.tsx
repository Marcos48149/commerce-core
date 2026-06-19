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
import { Loader2 } from 'lucide-react';
import { useCreateWebhook, useUpdateWebhook, useWebhook } from '@/hooks/use-webhooks';
import { toast } from 'sonner';

const WEBHOOK_EVENTS = [
  { value: 'order_created', label: 'order_created' },
  { value: 'order_paid', label: 'order_paid' },
  { value: 'order_cancelled', label: 'order_cancelled' },
  { value: 'order_updated', label: 'order_updated' },
  { value: 'inventory_updated', label: 'inventory_updated' },
  { value: 'customer_created', label: 'customer_created' },
] as const;

const webhookSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  url: z.string().url('La URL no es válida'),
  events: z.array(z.string()).min(1, 'Selecciona al menos un evento'),
  isActive: z.boolean().default(true),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

interface WebhookFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
}

export function WebhookForm({ open, onOpenChange, editId }: WebhookFormProps) {
  const createMutation = useCreateWebhook();
  const updateMutation = useUpdateWebhook(editId ?? '');
  const { data: webhook, isLoading: webhookLoading } = useWebhook(editId ?? '');

  const isEditing = !!editId;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema) as any,
    defaultValues: { name: '', url: '', events: [], isActive: true },
  });

  useEffect(() => {
    if (isEditing && webhook) {
      reset({
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive ?? true,
      });
    } else if (!isEditing) {
      reset({ name: '', url: '', events: [], isActive: true });
    }
  }, [webhook, isEditing, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: WebhookFormValues) {
    try {
      if (isEditing && editId) {
        await updateMutation.mutateAsync(data);
        toast.success('Webhook actualizado correctamente');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Webhook creado correctamente');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Error al actualizar el webhook' : 'Error al crear el webhook');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Webhook' : 'Nuevo Webhook'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la configuración del webhook.'
              : 'Configura un webhook para recibir eventos.'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && webhookLoading ? (
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
                    <Input id="name" {...field} placeholder="Nombre del webhook" />
                  )}
                />
                {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Controller
                  control={control}
                  name="url"
                  render={({ field }) => (
                    <Input id="url" {...field} placeholder="https://ejemplo.com/webhook" />
                  )}
                />
                {errors.url && <FormMessage>{errors.url.message}</FormMessage>}
              </div>

              <div className="space-y-2">
                <Label>Eventos</Label>
                <Controller
                  control={control}
                  name="events"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {WEBHOOK_EVENTS.map((event) => (
                        <label
                          key={event.value}
                          className="flex items-center gap-2 rounded-md border p-2 cursor-pointer text-sm hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            checked={field.value.includes(event.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, event.value]);
                              } else {
                                field.onChange(field.value.filter((v) => v !== event.value));
                              }
                            }}
                          />
                          {event.label}
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.events && <FormMessage>{errors.events.message}</FormMessage>}
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
                        Webhook activo
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
                {isEditing ? 'Guardar Cambios' : 'Crear Webhook'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
