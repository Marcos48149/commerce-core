'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VariantEditor } from './variant-editor';
import { useCreateProduct, useUpdateProduct, type Product, type ProductVariant } from '@/hooks/use-products';
import { useCategories, type Category } from '@/hooks/use-categories';
import { useCollections, type Collection } from '@/hooks/use-collections';
import { toast } from 'sonner';
import { Plus, X, Loader2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  sku: z.string().min(1, 'El SKU es requerido'),
  price: z.coerce.number()
    .positive('El precio debe ser mayor a 0'),
  compareAtPrice: z.coerce.number().optional(),
  categories: z.array(z.string()).default([]),
  collections: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  depth: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  variants: z.array(z.object({
    name: z.string().min(1, 'El nombre de la variante es requerido'),
    sku: z.string().min(1, 'El SKU de la variante es requerido'),
    price: z.coerce.number()
      .positive('El precio debe ser mayor a 0'),
    stock: z.coerce.number()
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo'),
    compareAtPrice: z.coerce.number().optional(),
  })).default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductForm({ product, isEditing }: ProductFormProps) {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? '');
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      price: undefined,
      compareAtPrice: undefined,
      categories: [],
      collections: [],
      images: [],
      width: undefined,
      height: undefined,
      depth: undefined,
      weight: undefined,
      status: 'active',
      variants: [],
    },
  });

  const [imageInputs, setImageInputs] = useState<string[]>([]);

  const variants = form.watch('variants');

  useEffect(() => {
    if (product) {
      const prodImages = product.images ?? [];
      setImageInputs(prodImages);
      form.reset({
        name: product.name,
        description: product.description ?? '',
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? undefined,
        categories: product.categories.map((c) => c.id),
        collections: product.collections.map((c) => c.id),
        images: prodImages,
        width: product.dimensions?.width ?? undefined,
        height: product.dimensions?.height ?? undefined,
        depth: product.dimensions?.depth ?? undefined,
        weight: product.weight ?? undefined,
        status: product.status,
        variants: product.variants.map((v: ProductVariant) => ({
          name: v.name,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          compareAtPrice: v.compareAtPrice ?? undefined,
        })),
      });
    }
  }, [product, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: ProductFormValues) {
    const payload = {
      ...data,
      compareAtPrice: data.compareAtPrice || null,
      width: data.width || null,
      height: data.height || null,
      depth: data.depth || null,
      weight: data.weight || null,
      slug: slugify(data.name),
    };

    try {
      if (isEditing && product?.id) {
        await updateMutation.mutateAsync(payload);
        toast.success('Producto actualizado correctamente');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Producto creado correctamente');
      }
      router.push('/dashboard/catalog/products');
    } catch {
      toast.error('Ocurrió un error al guardar el producto');
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre del producto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="flex h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Descripción del producto"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PROD-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                          <SelectItem value="draft">Borrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Precios y Stock</h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compareAtPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Comparativo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dimensiones y Peso</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ancho (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alto (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prof. (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Categorías y Colecciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Categorías</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {categories?.map((cat: Category) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.watch('categories').includes(cat.id)}
                      onChange={(e) => {
                        const current = form.getValues('categories');
                        if (e.target.checked) {
                          form.setValue('categories', [...current, cat.id]);
                        } else {
                          form.setValue('categories', current.filter((id) => id !== cat.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    {cat.name}
                  </label>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-sm text-muted-foreground">No hay categorías disponibles</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Colecciones</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {collections?.map((col: Collection) => (
                  <label key={col.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.watch('collections').includes(col.id)}
                      onChange={(e) => {
                        const current = form.getValues('collections');
                        if (e.target.checked) {
                          form.setValue('collections', [...current, col.id]);
                        } else {
                          form.setValue('collections', current.filter((id) => id !== col.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    {col.name}
                  </label>
                ))}
                {(!collections || collections.length === 0) && (
                  <p className="text-sm text-muted-foreground">No hay colecciones disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Imágenes</h3>
          {imageInputs.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={url}
                onChange={(e) => {
                  const updated = [...imageInputs];
                  updated[index] = e.target.value;
                  setImageInputs(updated);
                  form.setValue('images', updated);
                }}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = imageInputs.filter((_, i) => i !== index);
                  setImageInputs(updated);
                  form.setValue('images', updated);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const updated = [...imageInputs, ''];
              setImageInputs(updated);
              form.setValue('images', updated);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Imagen
          </Button>
        </div>

        <VariantEditor
          variants={variants}
          onChange={(newVariants) => form.setValue('variants', newVariants as any)}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/catalog/products')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
