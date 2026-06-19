'use client';

import { PageHeader } from '@/components/shared/page-header';
import { ProductForm } from '@/components/products/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Producto"
        description="Completa el formulario para crear un nuevo producto"
      />
      <ProductForm />
    </div>
  );
}
