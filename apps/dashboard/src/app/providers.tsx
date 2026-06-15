'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { StoreProvider } from '@/providers/store-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>{children}</StoreProvider>
    </AuthProvider>
  );
}
