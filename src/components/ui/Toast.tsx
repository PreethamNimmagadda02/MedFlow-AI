import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface ToastContextType {
    showToast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: Toast['type'], message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
                aria-live="polite"
                aria-label="Notifications"
            >
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle size={18} className="text-success-500 shrink-0" />,
        error: <XCircle size={18} className="text-danger-500 shrink-0" />,
        info: <Info size={18} className="text-accent-500 shrink-0" />,
    };

    const bgColors = {
        success: 'bg-success-50 border-success-200',
        error: 'bg-danger-50 border-danger-200',
        info: 'bg-accent-50 border-accent-200',
    };

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in min-w-[280px] max-w-[400px] ${bgColors[toast.type]}`}
            role="alert"
        >
            {icons[toast.type]}
            <p className="text-sm text-surface-800 flex-1">{toast.message}</p>
            <button
                onClick={onDismiss}
                className="p-0.5 text-surface-400 hover:text-surface-600 transition-colors shrink-0"
                aria-label="Dismiss notification"
            >
                <X size={14} />
            </button>
        </div>
    );
}
