'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms — default 5000; 0 = no auto-dismiss
}

type AddToastInput = Omit<Toast, 'id'>;

interface ToastContextValue {
  addToast: (input: AddToastInput) => string;
  removeToast: (id: string) => void;
  /** Convenience helpers */
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ─── Theme maps ───────────────────────────────────────────────────────────────

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; accentColor: string; borderColor: string; bgColor: string }
> = {
  success: {
    icon: <CheckCircle size={18} />,
    accentColor: '#00c853',
    borderColor: 'rgba(0,200,83,0.25)',
    bgColor: 'rgba(0,200,83,0.08)',
  },
  error: {
    icon: <XCircle size={18} />,
    accentColor: '#ff3d3d',
    borderColor: 'rgba(255,61,61,0.25)',
    bgColor: 'rgba(255,61,61,0.08)',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    accentColor: '#ff9800',
    borderColor: 'rgba(255,152,0,0.25)',
    bgColor: 'rgba(255,152,0,0.08)',
  },
  info: {
    icon: <Info size={18} />,
    accentColor: '#00d4ff',
    borderColor: 'rgba(0,212,255,0.25)',
    bgColor: 'rgba(0,212,255,0.08)',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Single Toast item ────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  }, [onRemove, toast.id]);

  // Entrance animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration === 0) return;
    timerRef.current = setTimeout(dismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, dismiss]);

  const cfg = toastConfig[toast.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        backgroundColor: '#141414',
        border: `1px solid ${cfg.borderColor}`,
        borderLeft: `3px solid ${cfg.accentColor}`,
        borderRadius: '0.625rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        minWidth: '18rem',
        maxWidth: '24rem',
        pointerEvents: 'all',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        transform: visible && !exiting ? 'translateX(0)' : 'translateX(calc(100% + 1.5rem))',
        opacity: visible && !exiting ? 1 : 0,
        background: `linear-gradient(135deg, ${cfg.bgColor}, #141414)`,
      }}
    >
      {/* Icon */}
      <span style={{ color: cfg.accentColor, flexShrink: 0, marginTop: '1px' }}>
        {cfg.icon}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#e5e5e5',
            lineHeight: 1.4,
          }}
        >
          {toast.title}
        </p>
        {toast.message && (
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.8125rem',
              color: '#a0a0a0',
              lineHeight: 1.4,
            }}
          >
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: '1.5rem',
          height: '1.5rem',
          borderRadius: '0.375rem',
          border: 'none',
          background: 'transparent',
          color: '#a0a0a0',
          cursor: 'pointer',
          transition: 'color 0.15s ease, background 0.15s ease',
          marginTop: '-0.125rem',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#e5e5e5';
          (e.currentTarget as HTMLButtonElement).style.background = '#222';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#a0a0a0';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((input: AddToastInput): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...input, id }]);
    return id;
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  );
  const error = useCallback(
    (title: string, message?: string) => addToast({ type: 'error', title, message }),
    [addToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    [addToast]
  );
  const info = useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  );

  const stack = mounted
    ? createPortal(
        <div
          aria-label="Notifications"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            alignItems: 'flex-end',
            pointerEvents: 'none',
          }}
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {stack}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

export default ToastProvider;
