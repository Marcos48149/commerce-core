'use client';

import { Badge } from '@/components/ui/badge';

interface AuditLogDetailProps {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

export function AuditLogDetail({ oldValue, newValue }: AuditLogDetailProps) {
  if (!oldValue && !newValue) {
    return <span className="text-sm text-muted-foreground">Sin datos disponibles</span>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      {oldValue && (
        <div className="space-y-1">
          <Badge variant="destructive" className="mb-1">Valor anterior</Badge>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 whitespace-pre-wrap break-all font-mono">
            {JSON.stringify(oldValue, null, 2)}
          </pre>
        </div>
      )}
      {newValue && (
        <div className="space-y-1">
          <Badge variant="success" className="mb-1">Valor nuevo</Badge>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 whitespace-pre-wrap break-all font-mono">
            {JSON.stringify(newValue, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
