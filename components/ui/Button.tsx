'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {},
  secondary: {
    background: 'transparent',
    border: '1px solid #222',
    color: '#e5e5e5',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: '#a0a0a0',
  },
};

const variantHoverClasses: Record<ButtonVariant, string> = {
  primary: 'hover:opacity-90 active:opacity-80',
  secondary: 'hover:border-[#00d4ff] hover:text-[#00d4ff] active:opacity-80',
  ghost: 'hover:text-[#e5e5e5] hover:bg-[#141414] active:opacity-80',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyle: React.CSSProperties =
      variant === 'primary'
        ? {
            background: 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%)',
            color: '#0a0a0a',
            border: '1px solid transparent',
          }
        : variantStyles[variant];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={{
          ...baseStyle,
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition: 'all 0.2s ease',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled && !loading ? 0.5 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        className={`
          relative select-none outline-none
          focus-visible:ring-2 focus-visible:ring-[#00d4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]
          ${sizeClasses[size]}
          ${!isDisabled ? variantHoverClasses[variant] : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {loading && (
          <Loader2
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            className="animate-spin shrink-0"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
