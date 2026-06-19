'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateApiKey } from '@/hooks/use-api-keys';
import { toast } from 'sonner';
import { Loader2, Copy, Check, KeyRound } from 'lucide-react';

interface ApiKeyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyCreateDialog({ open, onOpenChange }: ApiKeyCreateDialogProps) {
  const [name, setName] = useState('');
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createMutation = useCreateApiKey();

  function handleClose() {
    setRawKey(null);
    setName('');
    setCopied(false);
    onOpenChange(false);
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    try {
      const result = await createMutation.mutateAsync({ name: name.trim() });
      setRawKey(result.rawKey);
      toast.success('API Key creada correctamente');
    } catch {
      toast.error('Error al crear la API Key');
    }
  }

  async function handleCopy() {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar al portapapeles');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className={rawKey ? 'max-w-lg' : 'max-w-md'}>
        {rawKey ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-green-600" />
                API Key Creada
              </DialogTitle>
              <DialogDescription>
                Copia esta clave ahora. No podrás verla nuevamente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Label className="text-xs text-muted-foreground mb-1 block">Tu API Key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-background rounded border p-2 break-all select-all">
                    {rawKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                    {copied ? (
                      <><Check className="h-4 w-4 mr-1 text-green-600" />Copiado</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1" />Copiar</>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-destructive font-medium">
                Esta clave no se mostrará nuevamente. Si la pierdes, deberás crear una nueva.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Crear API Key</DialogTitle>
              <DialogDescription>
                Ingresa un nombre para identificar la API Key.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Producción - Backend"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
