'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PromotionForm } from '@/components/promotions/promotion-form';
import { usePromotion } from '@/hooks/use-promotions';
import { ArrowLeft } from 'lucide-react';

export default function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: promotion, isLoading } = usePromotion(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Promoción no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/promotions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Promoción</h1>
          <p className="text-sm text-muted-foreground mt-1">{promotion.name}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <PromotionForm promotion={promotion} />
      </div>
    </div>
  );
}
