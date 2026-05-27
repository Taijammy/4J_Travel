"use client";
import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from "react";

interface Toast {
  id:      string;
  message: string;
  type:    "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: "✅",
  error:   "❌",
  info:    "ℹ️",
  warning: "⚠️",
};

const COLORS = {
  success: "bg-green-500/10 border-green-500/30 text-green-400",
  error:   "bg-red-500/10   border-red-500/30   text-red-400",
  info:    "bg-blue-500/10  border-blue-500/30  text-blue-400",
  warning: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    setTimeout(() => setVisible(true), 10);
    // Slide out then remove
    const out = setTimeout(() => setVisible(false), 3000);
    const rm  = setTimeout(onRemove, 3400);
    return () => { clearTimeout(out); clearTimeout(rm); };
  }, []);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300
      ${COLORS[toast.type]}
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ minWidth: 240, maxWidth: 320 }}>
      <span className="text-base shrink-0">{ICONS[toast.type]}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onRemove, 300); }}
        className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0 text-lg leading-none">
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — bottom center on mobile, top right on desktop */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center
                      md:bottom-auto md:top-6 md:right-6 md:left-auto md:translate-x-0 md:items-end">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
