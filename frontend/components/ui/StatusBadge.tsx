import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (['active', 'occupied', 'paid', 'resolved'].includes(s)) {
      return 'border-emerald-500/35 text-emerald-500 bg-emerald-500/10';
    }
    if (['pending', 'in progress', 'under maintenance', 'maintenance'].includes(s)) {
      return 'border-primary/35 text-primary bg-primary/10';
    }
    if (['late', 'vacant', 'open', 'high'].includes(s)) {
      return 'border-red-500/35 text-red-500 bg-red-500/10';
    }
    return 'border-border text-muted-foreground bg-secondary/30';
  };

  return (
    <span className={cn(
      "px-3 py-1 text-[9px] font-bold rounded-md uppercase tracking-[0.16em] border transition-colors duration-300 whitespace-nowrap",
      getStatusStyles(status),
      className
    )}>
      {status}
    </span>
  );
};
