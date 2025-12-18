import { useState, useCallback, useMemo } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// トースト管理フック
interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return useMemo(() => ({
    toasts,
    showToast,
    removeToast,
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
  }), [toasts, showToast, removeToast]);
}
