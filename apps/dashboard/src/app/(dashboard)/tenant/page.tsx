'use client';

import { PageHeader } from '@/components/shared/page-header';
import { TenantProfile } from '@/components/tenant/tenant-profile';

export default function TenantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant"
        description="Información general del tenant."
      />
      <TenantProfile />
    </div>
  );
}
