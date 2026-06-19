'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useTenant } from '@/hooks/use-tenant';
import { useAuth } from '@/providers/auth-provider';
import { TenantEditDialog } from './tenant-edit-dialog';
import { Pencil, Building2, Calendar } from 'lucide-react';

export function TenantProfile() {
  const [editOpen, setEditOpen] = useState(false);
  const { data: tenant, isLoading, isError, refetch } = useTenant();
  const { session } = useAuth();

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <ErrorState message="Error al cargar el tenant" onRetry={() => refetch()} />;
  if (!tenant) return null;

  const isSuperAdmin = session?.isSuperAdmin ?? false;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Información del Tenant</CardTitle>
          </div>
          {isSuperAdmin && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                <p className="font-medium">{tenant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Slug</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{tenant.slug}</p>
                  <Badge variant="secondary" className="text-xs">Solo SuperAdmin</Badge>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Creado el {new Date(tenant.createdAt).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <TenantEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentName={tenant.name}
      />
    </>
  );
}
