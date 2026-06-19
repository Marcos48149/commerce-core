'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { RoleForm } from '@/components/iam/role-form';

export default function EditRolePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Rol"
        description="Modifica los permisos y configuración del rol"
      />
      <RoleForm roleId={id} isEditing />
    </div>
  );
}
