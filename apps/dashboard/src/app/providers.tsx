'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { StoreProvider } from '@/providers/store-provider';
import { QueryProvider } from '@/providers/query-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <StoreProvider>{children}</StoreProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
