"use client";

import { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-hide after duration (default: 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer = () => {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-500",
          border: "border-green-400/30",
          icon: "✅",
          shadow: "shadow-green-500/25"
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-500 to-pink-500",
          border: "border-red-400/30",
          icon: "❌",
          shadow: "shadow-red-500/25"
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-yellow-500 to-orange-500",
          border: "border-yellow-400/30",
          icon: "⚠️",
          shadow: "shadow-yellow-500/25"
        };
      case "info":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
          border: "border-blue-400/30",
          icon: "ℹ️",
          shadow: "shadow-blue-500/25"
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`${styles.bg} ${styles.border} border backdrop-blur-xl rounded-2xl p-6 text-white shadow-2xl ${styles.shadow} transform transition-all duration-300 animate-in slide-in-from-right-full`}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl flex-shrink-0">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg mb-1">{toast.title}</h4>
          <p className="text-white/90 text-sm leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 w-full bg-white/20 rounded-full h-1">
        <div 
          className="bg-white/60 h-1 rounded-full transition-all duration-300 ease-linear"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

// Convenience functions for common toast types
export const showSuccessToast = (title: string, message: string, duration?: number) => {
  // This will be used by the context
  return { type: "success" as const, title, message, duration };
};

export const showErrorToast = (title: string, message: string, duration?: number) => {
  return { type: "error" as const, title, message, duration };
};

export const showInfoToast = (title: string, message: string, duration?: number) => {
  return { type: "info" as const, title, message, duration };
};

export const showWarningToast = (title: string, message: string, duration?: number) => {
  return { type: "warning" as const, title, message, duration };
};
