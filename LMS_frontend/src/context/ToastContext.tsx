import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastItem = { id, message, type, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep at most 5 visible toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      
      {/* Floating Toasts Container (Top-Left floating for RTL UI) */}
      <div
        dir="rtl"
        className="fixed top-5 left-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full sm:w-auto pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 text-xs font-bold ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800/80 shadow-emerald-950/30'
                : t.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-800/80 shadow-rose-950/30'
                : t.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-800/80 shadow-amber-950/30'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/80 shadow-slate-950/30'
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {t.type === 'success' && <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle size={20} className="text-rose-400 shrink-0" />}
              {t.type === 'warning' && <AlertTriangle size={20} className="text-amber-400 shrink-0" />}
              {t.type === 'info' && <Info size={20} className="text-teal-400 shrink-0" />}
              <span className="leading-relaxed font-semibold break-words">{t.message}</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0"
              title="إغلاق الإشعار"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
