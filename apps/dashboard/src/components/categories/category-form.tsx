'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useCreateCategory, useUpdateCategory, type Category } from '@/hooks/use-categories';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  categories: Category[];
  onSuccess: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryForm({ category, categories, onSuccess }: CategoryFormProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(category?.id ?? '');

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: '',
    },
  });

  const nameValue = form.watch('name');

  useEffect(() => {
    if (!category) {
      form.setValue('slug', slugify(nameValue));
    }
  }, [nameValue, category, form]);

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        parentId: category.parentId ?? '',
      });
    }
  }, [category, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: CategoryFormValues) {
    const payload = {
      ...data,
      parentId: data.parentId || null,
    };

    try {
      if (category) {
        await updateMutation.mutateAsync(payload);
        toast.success('Categoría actualizada correctamente');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Categoría creada correctamente');
      }
      onSuccess();
    } catch {
      toast.error('Ocurrió un error al guardar la categoría');
    }
  }

  const availableParents = categories.filter((c) => c.id !== category?.id);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre de la categoría" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="nombre-categoria" />
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
                  placeholder="Descripción de la categoría"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría Padre</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin categoría padre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría padre</SelectItem>
                    {availableParents.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {category ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
