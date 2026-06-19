'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDeleteApiKey, type ApiKey } from '@/hooks/use-api-keys';
import { toast } from 'sonner';

interface ApiKeyRevokeDialogProps {
  apiKey: ApiKey | null;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyRevokeDialog({ apiKey, onOpenChange }: ApiKeyRevokeDialogProps) {
  const deleteMutation = useDeleteApiKey();

  async function handleRevoke() {
    if (!apiKey) return;
    try {
      await deleteMutation.mutateAsync(apiKey.id);
      toast.success('API Key revocada correctamente');
      onOpenChange(false);
    } catch {
      toast.error('Error al revocar la API Key');
    }
  }

  return (
    <ConfirmDialog
      open={!!apiKey}
      onOpenChange={(open) => { if (!open) onOpenChange(false); }}
      title="Revocar API Key"
      description={
        apiKey
          ? `¿Revocar API Key "${apiKey.name}"? Esta acción no se puede deshacer.`
          : ''
      }
      confirmLabel="Revocar"
      variant="destructive"
      onConfirm={handleRevoke}
      loading={deleteMutation.isPending}
    />
  );
}
