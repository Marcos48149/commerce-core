'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface GenerateCouponsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (quantity: number, prefix?: string) => Promise<void>;
  loading?: boolean;
}

export function GenerateCouponsDialog({
  open,
  onOpenChange,
  onGenerate,
  loading,
}: GenerateCouponsDialogProps) {
  const [quantity, setQuantity] = useState(10);
  const [prefix, setPrefix] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(quantity, prefix || undefined);
    setQuantity(10);
    setPrefix('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Generar Cupones</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefijo (opcional)</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Ej: VERANO"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
