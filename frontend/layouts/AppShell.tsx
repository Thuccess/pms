"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/layouts/Sidebar";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div
        className={cn(
          "flex-1 transition-all duration-300 flex flex-col min-h-screen",
          isCollapsed ? "lg:pl-20 md:pl-20" : "lg:pl-64 md:pl-20"
        )}
      >
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 w-full page-container py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
};
