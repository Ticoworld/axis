"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000); // Auto dismiss after 5s
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = useMemo(() => ({
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    warning: (msg: string) => addToast(msg, "warning"),
    info: (msg: string) => addToast(msg, "info"),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`
                pointer-events-auto w-80 p-4 border flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                ${t.type === "success" ? "bg-black border-[#39FF14]" : ""}
                ${t.type === "error" ? "bg-black border-red-500" : ""}
                ${t.type === "warning" ? "bg-black border-yellow-400" : ""}
                ${t.type === "info" ? "bg-black border-white" : ""}
              `}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === "success" && <CheckCircle size={16} className="text-[#39FF14]" />}
                {t.type === "error" && <X size={16} className="text-red-500" />}
                {t.type === "warning" && <AlertTriangle size={16} className="text-yellow-400" />}
                {t.type === "info" && <Info size={16} className="text-white" />}
              </div>
              <div className="flex-1">
                <p className={`font-mono text-xs font-bold uppercase
                  ${t.type === "success" ? "text-[#39FF14]" : ""}
                  ${t.type === "error" ? "text-red-500" : ""}
                  ${t.type === "warning" ? "text-yellow-400" : ""}
                  ${t.type === "info" ? "text-white" : ""}
                `}>
                  {t.type}
                </p>
                <p className="font-mono text-xs text-muted mt-1 leading-tight">
                  {t.message}
                </p>
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-muted hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
