'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CategoryTable } from '@/components/categories/category-table';
import { CategoryForm } from '@/components/categories/category-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useCategories, useDeleteCategory, type Category } from '@/hooks/use-categories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const deleteMutation = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Categoría eliminada correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar la categoría');
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const hasChildren = deleteTarget ? deleteTarget.children.length > 0 : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Gestiona las categorías del catálogo"
        actionLabel="Nueva Categoría"
        onAction={handleCreate}
      />

      <CategoryTable
        categories={categories ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar categorías' : null}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            categories={categories ?? []}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="¿Eliminar categoría?"
        description={
          deleteTarget
            ? hasChildren
              ? `"${deleteTarget.name}" tiene subcategorías. ¿Eliminar de todas formas?`
              : `¿Estás seguro de que deseas eliminar "${deleteTarget.name}"?`
            : ''
        }
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
