'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PromotionForm } from '@/components/promotions/promotion-form';
import { ArrowLeft } from 'lucide-react';

export default function NewPromotionPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/promotions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Promoción</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea una nueva promoción con descuento
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <PromotionForm />
      </div>
    </div>
  );
}
