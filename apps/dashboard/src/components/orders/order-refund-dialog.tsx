'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OrderRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number) => void;
  maxAmount: number;
  loading?: boolean;
}

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
}

export function OrderRefundDialog({
  open,
  onOpenChange,
  onConfirm,
  maxAmount,
  loading,
}: OrderRefundDialogProps) {
  const [amount, setAmount] = useState('');

  const parsedAmount = parseFloat(amount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= maxAmount;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(parsedAmount);
    setAmount('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setAmount('');
        onOpenChange(val);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reembolsar Pedido</DialogTitle>
          <DialogDescription>
            Ingresa el monto a reembolsar. Máximo: {formatARS(maxAmount)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="refund-amount">Monto a reembolsar (ARS)</Label>
          <Input
            id="refund-amount"
            type="number"
            step="0.01"
            min="0"
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          {amount && !isValid && (
            <p className="text-sm text-destructive">
              Ingresa un monto válido entre $0 y {formatARS(maxAmount)}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Volver
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || loading}>
            {loading ? 'Procesando...' : `Reembolsar ${isValid ? formatARS(parsedAmount) : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
