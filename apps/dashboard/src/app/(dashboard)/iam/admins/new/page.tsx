'use client';

import { PageHeader } from '@/components/shared/page-header';
import { AdminForm } from '@/components/iam/admin-form';

export default function NewAdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Administrador"
        description="Crea un nuevo administrador para el sistema"
      />
      <AdminForm />
    </div>
  );
}
