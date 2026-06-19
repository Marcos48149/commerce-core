'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AuditLogTable } from '@/components/system/audit-log-table';
import { AuditLogFilters } from '@/components/system/audit-log-filters';
import { Pagination } from '@/components/shared/pagination';
import { useAuditLogs } from '@/hooks/use-audit-logs';

export default function AuditLogsPage() {
  const [action, setAction] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    limit: 50,
    action: action || undefined,
    adminEmail: adminEmail || undefined,
    entityType: entityType || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleReset = useCallback(() => {
    setAction('');
    setAdminEmail('');
    setEntityType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registros de Auditoría"
        description="Consulta el historial de cambios en el sistema."
      />

      <AuditLogFilters
        action={action}
        adminEmail={adminEmail}
        entityType={entityType}
        startDate={startDate}
        endDate={endDate}
        onActionChange={handleFilterChange(setAction)}
        onAdminEmailChange={handleFilterChange(setAdminEmail)}
        onEntityTypeChange={handleFilterChange(setEntityType)}
        onStartDateChange={handleFilterChange(setStartDate)}
        onEndDateChange={handleFilterChange(setEndDate)}
        onReset={handleReset}
      />

      <AuditLogTable
        logs={data?.data ?? []}
        loading={isLoading}
        error={isError ? 'Error al cargar los registros de auditoría' : null}
        onRetry={() => refetch()}
      />

      {data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
