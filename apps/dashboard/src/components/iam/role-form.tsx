'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FormField,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useCreateRole, useUpdateRole, useRole, type Role, type Permission } from '@/hooks/use-roles';
import { usePermissions, type PermissionGroup } from '@/hooks/use-permissions';
import { toast } from 'sonner';
import { Loader2, Info } from 'lucide-react';

const roleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  scope: z.enum(['tenant', 'store']),
  permissionIds: z.array(z.string()).default([]),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  roleId?: string;
  isEditing?: boolean;
}

export function RoleForm({ roleId, isEditing }: RoleFormProps) {
  const router = useRouter();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole(roleId ?? '');
  const { data: role, isLoading: roleLoading } = useRole(roleId ?? '');
  const { data: permissionGroups, isLoading: permissionsLoading } = usePermissions();

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema) as any,
    defaultValues: { name: '', scope: 'store', permissionIds: [] },
  });

  const selectedPermissionIds = watch('permissionIds');

  const groupedPermissions = useMemo(() => {
    if (!permissionGroups) return [];
    return permissionGroups;
  }, [permissionGroups]);

  useEffect(() => {
    if (isEditing && role) {
      reset({
        name: role.name,
        scope: role.scope,
        permissionIds: role.permissions?.map((p) => p.id) ?? [],
      });
    }
  }, [role, isEditing, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const loading = (isEditing && roleLoading) || permissionsLoading;

  function isCategoryFullySelected(categoryPermissions: Permission[]) {
    return categoryPermissions.every((p) => selectedPermissionIds.includes(p.id));
  }

  function toggleCategory(categoryPermissions: Permission[]) {
    const allSelected = isCategoryFullySelected(categoryPermissions);
    if (allSelected) {
      setValue(
        'permissionIds',
        selectedPermissionIds.filter((id) => !categoryPermissions.some((p) => p.id === id)),
      );
    } else {
      const newIds = [...selectedPermissionIds];
      for (const perm of categoryPermissions) {
        if (!newIds.includes(perm.id)) {
          newIds.push(perm.id);
        }
      }
      setValue('permissionIds', newIds);
    }
  }

  async function onSubmit(data: RoleFormValues) {
    try {
      if (isEditing && roleId) {
        await updateMutation.mutateAsync(data);
        toast.success('Rol actualizado correctamente');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Rol creado correctamente');
      }
      router.push('/dashboard/iam/roles');
    } catch {
      toast.error('Ocurrió un error al guardar el rol');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isEditing && !role) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información del Rol</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  {isEditing && role?.isSystem ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Input {...field} disabled className="opacity-60" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Los roles de sistema no pueden cambiar de nombre
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Input {...field} placeholder="Nombre del rol" />
                  )}
                </FormControl>
                {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
              </FormItem>
            )}
          />

          <Controller
            control={control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alcance</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="store">Tienda</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {errors.scope && <FormMessage>{errors.scope.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Permisos</h3>
        {groupedPermissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay permisos disponibles</p>
        ) : (
          <div className="space-y-6">
            {groupedPermissions.map((group) => (
              <PermissionGroupCard
                key={group.category}
                group={group}
                selectedPermissionIds={selectedPermissionIds}
                isFullySelected={isCategoryFullySelected(group.permissions)}
                onToggleCategory={() => toggleCategory(group.permissions)}
                onTogglePermission={(permId) => {
                  setValue(
                    'permissionIds',
                    selectedPermissionIds.includes(permId)
                      ? selectedPermissionIds.filter((id) => id !== permId)
                      : [...selectedPermissionIds, permId],
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Actualizar Rol' : 'Crear Rol'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/iam/roles')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function PermissionGroupCard({
  group,
  selectedPermissionIds,
  isFullySelected,
  onToggleCategory,
  onTogglePermission,
}: {
  group: PermissionGroup;
  selectedPermissionIds: string[];
  isFullySelected: boolean;
  onToggleCategory: () => void;
  onTogglePermission: (permId: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">{group.category}</h4>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={isFullySelected}
            onChange={onToggleCategory}
            className="rounded border-gray-300"
          />
          Seleccionar todo
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.permissions.map((perm) => (
          <label
            key={perm.id}
            className="flex items-start gap-2 text-sm cursor-pointer p-2 rounded hover:bg-muted/50"
          >
            <input
              type="checkbox"
              checked={selectedPermissionIds.includes(perm.id)}
              onChange={() => onTogglePermission(perm.id)}
              className="mt-0.5 rounded border-gray-300"
            />
            <div>
              <span className="font-medium">{perm.name}</span>
              {perm.description && (
                <p className="text-xs text-muted-foreground">{perm.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
