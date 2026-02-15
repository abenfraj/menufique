"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <span key={t.id}>{t.message}</span>
        ))}
      </div>
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const TOAST_CONFIG: Record<
  ToastType,
  { bg: string; icon: React.ReactNode }
> = {
  success: {
    bg: "bg-green-600 text-white",
    icon: <CheckCircle size={16} className="shrink-0" />,
  },
  error: {
    bg: "bg-red-600 text-white",
    icon: <AlertCircle size={16} className="shrink-0" />,
  },
  warning: {
    bg: "bg-amber-500 text-white",
    icon: <AlertTriangle size={16} className="shrink-0" />,
  },
  info: {
    bg: "bg-gray-900 text-white",
    icon: <Info size={16} className="shrink-0" />,
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enter = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 5s
    const dismiss = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);
    return () => {
      clearTimeout(enter);
      clearTimeout(dismiss);
    };
  }, [toast.id, onDismiss]);

  const { bg, icon } = TOAST_CONFIG[toast.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex min-w-[280px] max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300",
        bg,
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-4 opacity-0"
      )}
    >
      {icon}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="shrink-0 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Fermer la notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
