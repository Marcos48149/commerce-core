'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Tag,
  Shield,
  Building2,
  Globe,
  Webhook,
  ClipboardList,
  Truck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Categories', href: '/categories', icon: FolderTree },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Promotions', href: '/promotions', icon: Tag },
];

const systemNav: NavItem[] = [
  { label: 'IAM', href: '/iam', icon: Shield },
  { label: 'Tenant', href: '/tenant', icon: Building2 },
  { label: 'Stores', href: '/tenant/stores', icon: Globe },
  { label: 'Plans', href: '/tenant/plans', icon: CreditCard },
  { label: 'Webhooks', href: '/system/webhooks', icon: Webhook },
  { label: 'Audit Logs', href: '/system/audit-logs', icon: ClipboardList },
  { label: 'Shipping', href: '/system/shipping', icon: Truck },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      data-slot="sidebar"
      className={cn(
        'flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="font-bold text-lg truncate">
            CommerceCore
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col gap-1 px-2">
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        {!collapsed && (
          <div className="px-4 py-2">
            <Separator />
          </div>
        )}

        <nav className="flex flex-col gap-1 px-2">
          {systemNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <Link
        href={item.href}
        data-slot="sidebar-nav-link"
        className={cn(
          'flex items-center justify-center rounded-lg p-2 transition-colors',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
        )}
        title={item.label}
      >
        <Icon className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      data-slot="sidebar-nav-link"
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
