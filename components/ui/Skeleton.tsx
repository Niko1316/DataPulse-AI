'use client';

import React from 'react';

// ─── Keyframe injection (once) ────────────────────────────────────────────────

const STYLE_ID = 'dp-skeleton-styles';

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes dp-skeleton-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .dp-skeleton {
      background-color: #1e1e1e;
      border-radius: 0.375rem;
      animation: dp-skeleton-pulse 1.8s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// ─── Base Skeleton ─────────────────────────────────────────────────────────────

export interface SkeletonProps {
  /** Extra Tailwind / CSS class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** aria-label for screen readers */
  'aria-label'?: string;
}

export function Skeleton({ className = '', style, 'aria-label': ariaLabel }: SkeletonProps) {
  // Inject styles on first render
  React.useEffect(() => { ensureStyles(); }, []);

  return (
    <div
      role="status"
      aria-label={ariaLabel ?? 'Loading…'}
      aria-busy="true"
      className={`dp-skeleton ${className}`}
      style={style}
    />
  );
}

// ─── SkeletonText ──────────────────────────────────────────────────────────────

export interface SkeletonTextProps {
  /** Number of text lines to render. Defaults to 3. */
  lines?: number;
  /** Make the last line shorter to mimic real text. Defaults to true. */
  shortenLast?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonText({
  lines = 3,
  shortenLast = true,
  className = '',
  style,
}: SkeletonTextProps) {
  React.useEffect(() => { ensureStyles(); }, []);

  return (
    <div
      role="status"
      aria-label="Loading text…"
      aria-busy="true"
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', ...style }}
    >
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        const width = shortenLast && isLast ? '60%' : '100%';
        return (
          <div
            key={i}
            className="dp-skeleton"
            style={{ height: '0.875rem', width, borderRadius: '0.25rem' }}
          />
        );
      })}
    </div>
  );
}

// ─── SkeletonCard ──────────────────────────────────────────────────────────────

export interface SkeletonCardProps {
  /** Show an image/banner placeholder at the top. Defaults to true. */
  showImage?: boolean;
  /** Height of the image placeholder in pixels. Defaults to 160. */
  imageHeight?: number;
  /** Number of text lines in the card body. Defaults to 3. */
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonCard({
  showImage = true,
  imageHeight = 160,
  lines = 3,
  className = '',
  style,
}: SkeletonCardProps) {
  React.useEffect(() => { ensureStyles(); }, []);

  return (
    <div
      role="status"
      aria-label="Loading card…"
      aria-busy="true"
      className={className}
      style={{
        backgroundColor: '#141414',
        border: '1px solid #222',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Image placeholder */}
      {showImage && (
        <div
          className="dp-skeleton"
          style={{
            width: '100%',
            height: imageHeight,
            borderRadius: 0,
          }}
        />
      )}

      {/* Content area */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Title */}
        <div className="dp-skeleton" style={{ height: '1.125rem', width: '55%', borderRadius: '0.25rem' }} />

        {/* Subtitle */}
        <div className="dp-skeleton" style={{ height: '0.875rem', width: '35%', borderRadius: '0.25rem' }} />

        {/* Divider gap */}
        <div style={{ height: '0.25rem' }} />

        {/* Body lines */}
        <SkeletonText lines={lines} />

        {/* Footer row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
          <div className="dp-skeleton" style={{ height: '2rem', flex: 1, borderRadius: '0.5rem' }} />
          <div className="dp-skeleton" style={{ height: '2rem', width: '2.5rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
