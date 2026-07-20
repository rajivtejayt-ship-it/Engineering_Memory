'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultIconProps } from '@/design-system/icons';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...newToast, id }]);
    setTimeout(() => {
      dismiss(id);
    }, 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={cn(
                'pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
                t.type === 'success' ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]' :
                t.type === 'error' ? 'bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]' :
                'bg-[var(--bg-panel)] border-[var(--border)] text-[var(--text)]'
              )}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle2 size={16} {...defaultIconProps} />}
                {t.type === 'error' && <AlertCircle size={16} {...defaultIconProps} />}
                {(t.type === 'info' || !t.type) && <Info size={16} {...defaultIconProps} className="text-[var(--accent)]" />}
              </div>
              
              <div className="flex flex-1 flex-col gap-1">
                <h4 className={cn('text-sm font-semibold', t.type === 'info' || !t.type ? 'text-[var(--text)]' : '')}>{t.title}</h4>
                {t.description && (
                  <p className={cn('text-xs', t.type === 'info' || !t.type ? 'text-[var(--text-secondary)]' : 'opacity-80')}>{t.description}</p>
                )}
              </div>
              
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 hover:bg-black/10 transition-opacity"
              >
                <X size={14} {...defaultIconProps} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
