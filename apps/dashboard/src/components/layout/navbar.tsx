'use client';

import { usePathname } from 'next/navigation';
import { StoreSwitcher } from './store-switcher';
import { UserNav } from './user-nav';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Productos',
  '/categories': 'Categorías',
  '/orders': 'Órdenes',
  '/customers': 'Clientes',
  '/promotions': 'Promociones',
  '/iam': 'IAM',
  '/tenant': 'Tienda',
  '/stores': 'Tiendas',
  '/webhooks': 'Webhooks',
  '/audit-logs': 'Auditoría',
  '/shipping': 'Envíos',
};

export function Navbar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentLabel = routeLabels[pathname] || segments[segments.length - 1] || 'Dashboard';

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{currentLabel}</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <StoreSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
