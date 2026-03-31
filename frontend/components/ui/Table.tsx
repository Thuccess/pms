import React from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className }: TableProps) => {
  return (
    <div className={cn("w-full overflow-x-auto premium-surface transition-colors duration-300", className)}>
      <table className="w-full min-w-[760px] text-left border-collapse">
        <thead>
          <tr className="bg-background/70 border-b border-border">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-[8px] sm:text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.24em] whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, onClick, className, ...props }: { children: React.ReactNode; onClick?: () => void; className?: string; [key: string]: any }) => (
  <tr
    onClick={onClick}
    className={cn(
      "group hover:bg-background/50 transition-colors duration-300",
      onClick && "cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <td className={cn("px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-[9px] sm:text-[10px] md:text-xs text-foreground uppercase tracking-wide transition-colors duration-300", className)} {...props}>
    {children}
  </td>
);
