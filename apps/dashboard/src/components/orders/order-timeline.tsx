'use client';

import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';
import type { TimelineEvent } from '@/hooks/use-orders';

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

const timelineOrder: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -2,
};

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const currentIndex = timelineOrder[currentStatus] ?? -1;

  const sorted = [...events].sort(
    (a, b) => (timelineOrder[a.status] ?? 0) - (timelineOrder[b.status] ?? 0),
  );

  const isCancelledOrRefunded = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED';

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Estado del Pedido</h3>
      <div className="space-y-0">
        {sorted.map((event, idx) => {
          const eventIndex = timelineOrder[event.status] ?? 0;
          const isCompleted = !isCancelledOrRefunded && eventIndex <= currentIndex && !!event.timestamp;
          const isCurrent = event.status === currentStatus;
          const isFuture = !isCompleted && !isCurrent;

          if (isCancelledOrRefunded && event.status !== currentStatus && event.status !== 'PENDING_PAYMENT') {
            return null;
          }

          return (
            <div key={event.status} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                    isCompleted && 'border-green-500 bg-green-50 dark:bg-green-950',
                    isCurrent && !isCompleted && 'border-blue-500 bg-blue-50 dark:bg-blue-950',
                    isFuture && 'border-muted-foreground/30 bg-muted',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle
                      className={cn(
                        'h-2 w-2',
                        isCurrent && !isCompleted && 'fill-blue-500 text-blue-500',
                        isFuture && 'fill-muted-foreground/30 text-muted-foreground/30',
                      )}
                    />
                  )}
                </div>
                {idx < sorted.length - 1 && (
                  <div
                    className={cn(
                      'mt-1 w-px flex-1',
                      isCompleted ? 'bg-green-200 dark:bg-green-800' : 'bg-muted-foreground/20',
                    )}
                  />
                )}
              </div>
              <div className={cn('pt-0.5', isFuture && 'opacity-40')}>
                <p className={cn('text-sm font-medium', isCurrent && 'text-blue-600 dark:text-blue-400')}>
                  {event.label}
                </p>
                {event.timestamp && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(event.timestamp).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
