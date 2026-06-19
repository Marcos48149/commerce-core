'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CustomerDetailView } from '@/components/customers/customer-detail';
import { ChevronLeft } from 'lucide-react';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/customers')}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a Clientes
      </Button>

      <CustomerDetailView customerId={id} />
    </div>
  );
}
