'use client';

import { useAuth } from '@/providers/auth-provider';
import { useStore } from '@/providers/store-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

export function StoreSwitcher() {
  const { session } = useAuth();
  const { currentStore, stores, setCurrentStore } = useStore();

  if (!session?.isSuperAdmin) return null;

  return (
    <Select
      value={currentStore?.id ?? ''}
      onValueChange={(value) => {
        const store = stores.find((s) => s.id === value);
        if (store) setCurrentStore(store);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select store..." />
      </SelectTrigger>
      <SelectContent>
        {stores.length === 0 && (
          <SelectItem value="" disabled>
            No stores available
          </SelectItem>
        )}
        {stores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            {store.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
