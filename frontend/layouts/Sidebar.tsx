"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Layers,
  Users, 
  CreditCard, 
  Wrench, 
  User,
  Settings as SettingsIcon, 
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/components/providers/AuthProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.dashboard },
  { icon: Building2, label: 'Properties', path: ROUTES.properties },
  { icon: Layers, label: 'Units', path: ROUTES.units },
  { icon: Users, label: 'Tenants', path: ROUTES.tenants },
  { icon: CreditCard, label: 'Payments', path: ROUTES.payments },
  { icon: Wrench, label: 'Maintenance', path: ROUTES.maintenance },
  { icon: User, label: 'Profile', path: ROUTES.profile },
  { icon: SettingsIcon, label: 'Settings', path: ROUTES.settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-background/95 backdrop-blur-md border-r border-border flex flex-col z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:w-20 md:w-20 w-64" : "lg:w-64 md:w-20 w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className={cn(
          "p-4 lg:p-8 flex flex-col items-center gap-2 relative",
          isCollapsed && "lg:p-4"
        )}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Manual Toggle Button (Desktop Only) */}
          <button 
            onClick={onToggleCollapse}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary hidden lg:block"
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <img
            src="/logo.png"
            alt="Luxorld Real Estate"
            className={cn(
              "w-10 h-10 lg:w-12 lg:h-12 object-contain transition-all duration-300",
              isCollapsed && "lg:w-10 lg:h-10"
            )}
          />
          <div className={cn(
            "text-center md:hidden lg:block transition-all duration-300",
            isCollapsed && "lg:hidden"
          )}>
            <span className="text-lg lg:text-xl font-bold tracking-widest uppercase block text-foreground">Luxorld</span>
            <span className="text-[7px] lg:text-[8px] text-muted-foreground uppercase tracking-[0.32em]">Real Estate</span>
          </div>
        </div>

        <nav className={cn(
          "flex-1 px-3 lg:px-6 py-4 space-y-2 overflow-y-auto custom-scrollbar",
          isCollapsed && "lg:px-3"
        )}>
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== ROUTES.dashboard && currentPath.startsWith(`${item.path}/`));
            return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => onClose()}
              className={cn(
                "flex items-center gap-4 px-3 lg:px-4 py-3 rounded-md transition-all duration-300 group relative",
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-primary hover:bg-card",
                isCollapsed && "lg:justify-center lg:px-0"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className={cn(
                "text-[10px] lg:text-xs uppercase tracking-widest md:hidden lg:block whitespace-nowrap",
                isCollapsed && "lg:hidden"
              )}>
                {item.label}
              </span>
              
              {/* Tooltip for MD and Collapsed LG */}
              <div className={cn(
                "absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded text-[10px] uppercase tracking-widest text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap",
                isCollapsed ? "lg:block" : "lg:hidden",
                "md:block"
              )}>
                {item.label}
              </div>
            </Link>
          )})}
        </nav>

        <div className={cn(
          "p-4 lg:p-6 border-t border-border",
          isCollapsed && "lg:p-4"
        )}>
          <button
            onClick={() => {
              logout();
              onClose();
              router.push(ROUTES.home);
            }}
            className={cn(
            "flex items-center gap-4 px-3 lg:px-4 py-3 w-full rounded-md text-muted-foreground hover:text-red-500 hover:bg-card transition-all duration-300 group relative",
            isCollapsed && "lg:justify-center lg:px-0"
          )}>
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={cn(
              "text-[10px] lg:text-xs uppercase tracking-widest md:hidden lg:block",
              isCollapsed && "lg:hidden"
            )}>
              Log Out
            </span>
            
            <div className={cn(
              "absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded text-[10px] uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap",
              isCollapsed ? "lg:block" : "lg:hidden",
              "md:block"
            )}>
              Log Out
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
