'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { ApiKeyTable } from '@/components/iam/api-key-table';
import { ApiKeyCreateDialog } from '@/components/iam/api-key-create-dialog';
import { ApiKeyRevokeDialog } from '@/components/iam/api-key-revoke-dialog';
import { useApiKeys, type ApiKey } from '@/hooks/use-api-keys';

export default function ApiKeysPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const { data: apiKeys, isLoading, isError, refetch } = useApiKeys();

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Gestiona las claves de API para integraciones"
        actionLabel="Crear API Key"
        onAction={() => setCreateOpen(true)}
      />

      <ApiKeyTable
        apiKeys={apiKeys ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar las API Keys' : null}
        onRetry={() => refetch()}
        onRevoke={setRevokeTarget}
      />

      <ApiKeyCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ApiKeyRevokeDialog apiKey={revokeTarget} onOpenChange={(open) => { if (!open) setRevokeTarget(null); }} />
    </div>
  );
}
