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
import { useCreateCollection, useUpdateCollection, type Collection } from '@/hooks/use-collections';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const collectionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  image: z.string().optional(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  collection?: Collection | null;
  onSuccess: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CollectionForm({ collection, onSuccess }: CollectionFormProps) {
  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection(collection?.id ?? '');

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: '',
    },
  });

  const nameValue = form.watch('name');

  useEffect(() => {
    if (!collection) {
      form.setValue('slug', slugify(nameValue));
    }
  }, [nameValue, collection, form]);

  useEffect(() => {
    if (collection) {
      form.reset({
        name: collection.name,
        slug: collection.slug,
        description: collection.description ?? '',
        image: collection.image ?? '',
      });
    }
  }, [collection, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(data: CollectionFormValues) {
    const payload = {
      ...data,
      image: data.image || null,
    };

    try {
      if (collection) {
        await updateMutation.mutateAsync(payload);
        toast.success('Colección actualizada correctamente');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Colección creada correctamente');
      }
      onSuccess();
    } catch {
      toast.error('Ocurrió un error al guardar la colección');
    }
  }

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
                <Input {...field} placeholder="Nombre de la colección" />
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
                <Input {...field} placeholder="nombre-coleccion" />
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
                  placeholder="Descripción de la colección"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Imagen</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://ejemplo.com/coleccion.jpg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {collection ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
