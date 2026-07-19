/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-6 left-6 z-[999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
                  isSuccess
                    ? 'bg-[#fbf9f7]/95 dark:bg-[#1a1c1a]/95 text-[#1b1c1b] dark:text-[#fbf9f7] border-[#54615b]/20 dark:border-white/10 shadow-[#54615b]/5'
                    : 'bg-rose-50/95 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 border-rose-200/50 dark:border-rose-500/10 shadow-rose-900/5'
                }`}
              >
                {/* Visual Icon */}
                <div className="mt-0.5">
                  {isSuccess ? (
                    <CheckCircle2 size={18} className="text-[#54615b] dark:text-[#bbcac2]" />
                  ) : (
                    <AlertCircle size={18} className="text-rose-500" />
                  )}
                </div>

                {/* Toast message text */}
                <div className="flex-1">
                  <p className="font-sans text-xs leading-relaxed font-semibold">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  id={`dismiss-toast-${toast.id}`}
                  onClick={() => dismissToast(toast.id)}
                  className="interactive p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#444748]/50 dark:text-[#c4c7c7]/50 hover:text-[#1b1c1b] dark:hover:text-[#fbf9f7] transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
