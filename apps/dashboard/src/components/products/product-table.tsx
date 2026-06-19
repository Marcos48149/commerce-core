'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  ImageOff,
} from 'lucide-react';
import type { Product } from '@/hooks/use-products';

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
}

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onDelete?: (product: Product) => void;
}

const SORTABLE_COLUMNS = ['name', 'price', 'stock', 'createdAt'];

export function ProductTable({
  products,
  loading,
  error,
  onRetry,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: ProductTableProps) {
  const router = useRouter();

  function SortIcon(column: string) {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  }

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message="Error al cargar productos" onRetry={onRetry} />;

  if (products.length === 0) {
    return (
      <EmptyState
        title="No hay productos"
        description="Comienza creando tu primer producto."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onSort?.('name')}
            >
              <div className="flex items-center gap-1">
                Nombre {SortIcon('name')}
              </div>
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onSort?.('price')}
            >
              <div className="flex items-center gap-1">
                Precio {SortIcon('price')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onSort?.('stock')}
            >
              <div className="flex items-center gap-1">
                Stock {SortIcon('stock')}
              </div>
            </TableHead>
            <TableHead>Estado</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => onSort?.('createdAt')}
            >
              <div className="flex items-center gap-1">
                Creado {SortIcon('createdAt')}
              </div>
            </TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/catalog/products/${product.id}/edit`)}
            >
              <TableCell>
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <ImageOff className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.sku}</TableCell>
              <TableCell>{formatARS(product.price)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <StatusBadge status={product.status} />
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(product.createdAt).toLocaleDateString('es-AR')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/catalog/products/${product.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(product)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
