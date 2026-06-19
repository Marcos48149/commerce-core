'use client';

import { PageHeader } from '@/components/shared/page-header';
import { RoleForm } from '@/components/iam/role-form';

export default function NewRolePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Rol"
        description="Crea un nuevo rol con permisos personalizados"
      />
      <RoleForm />
    </div>
  );
}
