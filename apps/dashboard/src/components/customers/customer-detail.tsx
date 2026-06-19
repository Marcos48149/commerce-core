'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
import {
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  Package,
  Home,
  Building,
} from 'lucide-react';
import {
  useCustomer,
  useCustomerOrders,
  type CustomerOrder,
  type CustomerAddress,
} from '@/hooks/use-customers';

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string): string {
  return `#${id.slice(0, 8)}`;
}

const addressTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  billing: Building,
};

function AddressIcon({ type }: { type: string }) {
  const Icon = addressTypeIcons[type.toLowerCase()] ?? MapPin;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
}

const addressTypeLabels: Record<string, string> = {
  shipping: 'Envío',
  billing: 'Facturación',
  home: 'Casa',
};

function addressTypeLabel(type: string): string {
  return addressTypeLabels[type.toLowerCase()] ?? type;
}

interface ProfileCardProps {
  customer: NonNullable<ReturnType<typeof useCustomer>['data']>;
}

function ProfileCard({ customer }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Información del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{customer.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{customer.displayName ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{customer.phone ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>Registrado el {formatDate(customer.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface AddressCardProps {
  address: CustomerAddress;
}

function AddressCard({ address }: AddressCardProps) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <AddressIcon type={address.type} />
      <div className="space-y-1 text-sm">
        <p className="font-medium capitalize">
          {addressTypeLabel(address.type)}
        </p>
        <p className="text-muted-foreground">{address.line1}</p>
        {address.line2 && (
          <p className="text-muted-foreground">{address.line2}</p>
        )}
        <p className="text-muted-foreground">
          {address.city}, {address.province}, {address.country}
        </p>
      </div>
    </div>
  );
}

interface OrdersSectionProps {
  customerId: string;
}

function OrdersSection({ customerId }: OrdersSectionProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useCustomerOrders(customerId, {
    page,
    limit: 20,
  });

  const columns: Column<CustomerOrder>[] = [
    {
      key: 'orderNumber',
      header: 'Pedido',
      render: (o) => (
        <span className="font-mono text-sm">{truncateId(o.id)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (o) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(o.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => formatARS(o.total),
    },
  ];

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError)
    return (
      <ErrorState
        message="Error al cargar los pedidos"
        onRetry={() => refetch()}
      />
    );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(o) => o.id}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}

interface AddressesSectionProps {
  addresses: CustomerAddress[];
}

function AddressesSection({ addresses }: AddressesSectionProps) {
  if (addresses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No tiene direcciones guardadas
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {addresses.map((addr) => (
        <AddressCard key={addr.id} address={addr} />
      ))}
    </div>
  );
}

interface CustomerDetailContentProps {
  customerId: string;
}

export function CustomerDetailView({
  customerId,
}: CustomerDetailContentProps) {
  const {
    data: customer,
    isLoading,
    isError,
    refetch,
  } = useCustomer(customerId);

  if (isLoading) return <LoadingSkeleton />;
  if (isError)
    return (
      <ErrorState
        message="Error al cargar el cliente"
        onRetry={() => refetch()}
      />
    );
  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{customer.displayName ?? customer.email}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cliente desde {formatDate(customer.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard customer={customer} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Direcciones ({customer.addresses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddressesSection addresses={customer.addresses} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Historial de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <OrdersSection customerId={customerId} />
        </CardContent>
      </Card>
    </div>
  );
}
