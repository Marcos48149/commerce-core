'use client';

import { PageHeader } from '@/components/shared/page-header';
import { PermissionList } from '@/components/iam/permission-list';

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Permisos"
        description="Lista completa de permisos disponibles en el sistema"
      />
      <PermissionList />
    </div>
  );
}
