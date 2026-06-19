'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAdmin, useUpdateAdmin, type Admin } from '@/hooks/use-admins';
import { useRoles, type Role } from '@/hooks/use-roles';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const createSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  displayName: z.string().min(1, 'El nombre es requerido'),
});

const editSchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().min(1, 'El nombre es requerido'),
  isActive: z.boolean(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

interface AdminFormProps {
  admin?: Admin;
  isEditing?: boolean;
}

export function AdminForm({ admin, isEditing }: AdminFormProps) {
  const router = useRouter();
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin(admin?.id ?? '');
  const { data: roles } = useRoles();

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(isEditing ? editSchema : createSchema) as any,
    defaultValues: isEditing && admin
      ? { email: admin.email, displayName: admin.displayName, isActive: admin.isActive }
      : { email: '', password: '', displayName: '' },
  });

  useEffect(() => {
    if (admin) {
      setSelectedRoleIds(admin.roles.map((r) => r.id));
    }
  }, [admin]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  }

  async function onSubmit(data: CreateFormValues | EditFormValues) {
    try {
      if (isEditing && admin) {
        const editData = data as EditFormValues;
        await updateMutation.mutateAsync({ ...editData, roleIds: selectedRoleIds } as any);
        toast.success('Administrador actualizado correctamente');
      } else {
        await createMutation.mutateAsync({ ...(data as CreateFormValues), roleIds: selectedRoleIds });
        toast.success('Administrador creado correctamente');
      }
      router.push('/iam/admins');
    } catch {
      toast.error('Ocurrió un error al guardar el administrador');
    }
  }

  if (isEditing && !admin) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <h3 className="text-lg font-medium">Información del Administrador</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="admin@ejemplo.com" />
              </FormControl>
              {errors.email && <FormMessage>{String(errors.email.message)}</FormMessage>}
            </FormItem>
          )}
        />

        {!isEditing && (
          <Controller
            control={control}
            name="password"
            render={({ field }) => {
              const err = (errors as Record<string, unknown>).password as { message?: string } | undefined;
              return (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Mínimo 8 caracteres" />
                  </FormControl>
                  {err && <FormMessage>{err.message ?? ''}</FormMessage>}
                </FormItem>
              );
            }}
          />
        )}

        <Controller
          control={control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre del administrador" />
              </FormControl>
              {errors.displayName && <FormMessage>{String(errors.displayName.message)}</FormMessage>}
            </FormItem>
          )}
        />

        {isEditing && (
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Select value={field.value ? 'true' : 'false'} onValueChange={(v) => field.onChange(v === 'true')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="rounded border-gray-300"
                />
                <span>{role.name}</span>
                <Badge variant="outline" className="text-[10px] ml-1">
                  {role.scope}
                </Badge>
              </label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay roles disponibles</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Actualizar Administrador' : 'Crear Administrador'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/iam/admins')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
