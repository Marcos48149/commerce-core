'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { MetricData } from '@/hooks/use-dashboard';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value);
}

interface StatsCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isCurrency?: boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function StatsCard({
  title,
  value,
  trend,
  icon: Icon,
  href,
  isCurrency = false,
  loading = false,
  error = false,
  onRetry,
}: StatsCardProps) {
  if (error) {
    return (
      <Card className="relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">Error al cargar</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-primary hover:underline mt-1"
            >
              Reintentar
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground';
  const trendText = trend === 0 ? '0%' : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;

  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>{trendText}</span>
            </div>
          </div>
          <p className="text-2xl font-bold">
            {isCurrency ? formatCurrency(value) : formatNumber(value)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
