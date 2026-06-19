'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { AdminForm } from '@/components/iam/admin-form';
import { useAdmin } from '@/hooks/use-admins';
import { Loader2 } from 'lucide-react';

export default function EditAdminPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: admin, isLoading } = useAdmin(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <p className="text-muted-foreground text-center py-12">Administrador no encontrado</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Administrador"
        description={`Editando: ${admin.displayName}`}
      />
      <AdminForm admin={admin} isEditing />
    </div>
  );
}
