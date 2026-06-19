'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { ProductForm } from '@/components/products/product-form';
import { useProduct } from '@/hooks/use-products';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading, isError, refetch } = useProduct(id);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !product) {
    return (
      <ErrorState
        message="No se pudo cargar el producto"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${product.name}`}
        description="Actualiza la información del producto"
      />
      <ProductForm product={product} isEditing />
    </div>
  );
}
