'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { OrderDetailView } from '@/components/orders/order-detail';
import { ChevronLeft } from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/orders')}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a Pedidos
      </Button>

      <OrderDetailView
        orderId={id}
        onBack={() => router.push('/dashboard/orders')}
      />
    </div>
  );
}
