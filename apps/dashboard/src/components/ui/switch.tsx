'use client';

import { cn } from '@/lib/utils';
import { useId } from 'react';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ id, checked, onCheckedChange, disabled, className }: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-input',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        id={switchId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]',
        )}
      />
    </label>
  );
}
