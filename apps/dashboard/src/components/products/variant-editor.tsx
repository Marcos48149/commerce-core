'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface VariantRow {
  name: string;
  sku: string;
  price: number | undefined;
  stock: number | undefined;
  compareAtPrice?: number | undefined;
}

interface VariantEditorProps {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const addVariant = () => {
    onChange([
      ...variants,
      { name: '', sku: '', price: undefined, stock: undefined, compareAtPrice: undefined },
    ]);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: string | number | undefined) => {
    const updated = variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Variantes</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="h-4 w-4 mr-1" />
          Agregar Variante
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sin variantes. El producto se creará como producto simple.
        </p>
      )}

      {variants.map((variant, index) => (
        <div
          key={index}
          className="grid grid-cols-5 gap-3 p-4 border rounded-lg relative"
        >
          <div className="space-y-1">
            <Label className="text-xs">Nombre</Label>
            <Input
              value={variant.name}
              onChange={(e) => updateVariant(index, 'name', e.target.value)}
              placeholder="Ej: Rojo, XL"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">SKU</Label>
            <Input
              value={variant.sku}
              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
              placeholder="SKU"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Precio</Label>
            <Input
              type="number"
              step="0.01"
              value={variant.price ?? ''}
              onChange={(e) =>
                updateVariant(index, 'price', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Stock</Label>
            <Input
              type="number"
              step="1"
              value={variant.stock ?? ''}
              onChange={(e) =>
                updateVariant(index, 'stock', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Precio Compar.</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                step="0.01"
                value={variant.compareAtPrice ?? ''}
                onChange={(e) =>
                  updateVariant(index, 'compareAtPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="0.00"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(index)}
                className="text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
