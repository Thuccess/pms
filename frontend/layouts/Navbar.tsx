import React from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronDown, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { ROUTES } from '@/constants/routes';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 sm:h-[4.5rem] lg:h-20 bg-background/85 backdrop-blur-xl border-b border-border/80 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-md text-muted-foreground hover:text-primary hover:bg-card lg:hidden transition-colors touch-target"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2 md:gap-3 pr-2 md:pr-4 border-r border-border/70">
          <img
            src="/logo.png"
            alt="Luxorld Real Estate"
            className="w-7 h-7 md:w-8 md:h-8 object-contain"
          />
          <div className="hidden md:block">
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Luxorld</p>
            <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-foreground">Real Estate</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search properties, tenants, payments..."
              className="w-full pl-10 pr-20 py-2.5 sm:py-3 bg-card/80 border border-border rounded-md text-[10px] sm:text-[11px] uppercase tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/60 text-foreground"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">
              /
            </span>
          </div>
        </div>

        <button
          className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-card md:hidden transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
        <div className="hidden lg:flex items-center gap-1 bg-card/80 border border-border p-1 rounded-md">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "p-1.5 rounded transition-all",
              theme === 'light' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary"
            )}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "p-1.5 rounded transition-all",
              theme === 'dark' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary"
            )}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              "p-1.5 rounded transition-all",
              theme === 'system' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary"
            )}
            title="System Preference"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          className="relative p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-card transition-all group"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full border-2 border-background" />
        </button>

        <Link href={ROUTES.profile || "/profile"} className="flex items-center gap-3 md:gap-4 pl-3 md:pl-4 lg:pl-6 border-l border-border/80 cursor-pointer group">
          <div className="text-right hidden xl:block">
            <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">{user?.name || "Admin User"}</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">Administrator</p>
          </div>
          <div className="relative">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt="User"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-md object-cover border border-border group-hover:border-primary transition-all"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
        </Link>
      </div>
    </header>
  );
};
