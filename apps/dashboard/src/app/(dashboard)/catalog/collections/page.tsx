'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CollectionTable } from '@/components/collections/collection-table';
import { CollectionForm } from '@/components/collections/collection-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useCollections, useDeleteCollection, type Collection } from '@/hooks/use-collections';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function CollectionsPage() {
  const { data: collections, isLoading, isError, refetch } = useCollections();
  const deleteMutation = useDeleteCollection();

  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCollection(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Colección eliminada correctamente');
      setDeleteTarget(null);
    } catch {
      toast.error('Error al eliminar la colección');
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingCollection(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colecciones"
        description="Gestiona las colecciones del catálogo"
        actionLabel="Nueva Colección"
        onAction={handleCreate}
      />

      <CollectionTable
        collections={collections ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar colecciones' : null}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCollection ? 'Editar Colección' : 'Nueva Colección'}
            </DialogTitle>
          </DialogHeader>
          <CollectionForm
            collection={editingCollection}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="¿Eliminar colección?"
        description={
          deleteTarget
            ? `¿Estás seguro de que deseas eliminar "${deleteTarget.name}"?`
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
