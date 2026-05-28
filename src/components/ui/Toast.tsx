"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const typeStyles: Record<ToastType, { bg: string; border: string; icon: any; color: string }> = {
    success: { bg: "#ECFDF5", border: "#6EE7B7", icon: CheckCircle, color: "#065F46" },
    error: { bg: "#FEF2F2", border: "#FCA5A5", icon: AlertCircle, color: "#991B1B" },
    info: { bg: "#EFF6FF", border: "#93C5FD", icon: Info, color: "#1E40AF" },
    warning: { bg: "#FFFBEB", border: "#FCD34D", icon: AlertCircle, color: "#92400E" },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 400 }}>
        {toasts.map((toast) => {
          const style = typeStyles[toast.type];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              style={{
                background: style.bg,
                border: `1.5px solid ${style.border}`,
                borderRadius: 12,
                padding: "0.875rem 1rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.05)",
                animation: "slideIn 0.3s ease",
              }}
            >
              <Icon style={{ width: 18, height: 18, color: style.color, flexShrink: 0, marginTop: 1 }} />
              <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600, color: style.color, lineHeight: 1.4 }}>{toast.message}</span>
              <button onClick={() => dismissToast(toast.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: style.color, opacity: 0.6 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
