import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-2xl bg-card border border-border rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden transition-colors duration-300 max-h-[92vh] sm:max-h-[88vh]",
              className
            )}
          >
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-background/70">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground uppercase tracking-[0.18em] pr-3">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-card transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5 md:p-6 max-h-[72vh] sm:max-h-[70vh] overflow-y-auto bg-card">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
