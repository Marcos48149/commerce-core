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
import { useUpdateTenant } from '@/hooks/use-tenant';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const tenantSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface TenantEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
}

export function TenantEditDialog({ open, onOpenChange, currentName }: TenantEditDialogProps) {
  const updateMutation = useUpdateTenant();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: { name: currentName },
  });

  useEffect(() => {
    reset({ name: currentName });
  }, [currentName, reset]);

  async function onSubmit(data: TenantFormValues) {
    try {
      await updateMutation.mutateAsync(data);
      toast.success('Tenant actualizado correctamente');
      onOpenChange(false);
    } catch {
      toast.error('Error al actualizar el tenant');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tenant</DialogTitle>
          <DialogDescription>Actualiza el nombre del tenant.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => <Input id="name" {...field} placeholder="Nombre del tenant" />}
              />
              {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
