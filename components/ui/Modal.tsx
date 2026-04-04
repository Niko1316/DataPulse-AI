'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Max width of the modal content panel. Defaults to '32rem' (512px). */
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = '32rem',
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'dp-modal-fade-in 0.2s ease forwards',
      }}
    >
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth,
          backgroundColor: '#141414',
          border: '1px solid #222',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 212, 255, 0.05)',
          animation: 'dp-modal-slide-up 0.25s ease forwards',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        {(title !== undefined) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #222',
            }}
          >
            <h2
              id="modal-title"
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#e5e5e5',
                letterSpacing: '0.01em',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                border: '1px solid #222',
                background: 'transparent',
                color: '#a0a0a0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#e5e5e5';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#444';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e1e1e';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#a0a0a0';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#222';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* No title: floating close button */}
        {title === undefined && (
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              border: '1px solid #222',
              background: 'transparent',
              color: '#a0a0a0',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#e5e5e5';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#444';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e1e1e';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#a0a0a0';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#222';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Body */}
        <div style={{ padding: '1.5rem', color: '#e5e5e5' }}>{children}</div>
      </div>

      <style>{`
        @keyframes dp-modal-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dp-modal-slide-up {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
