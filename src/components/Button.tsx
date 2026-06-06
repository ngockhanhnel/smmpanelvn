import { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'gradient' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export default function Button({
  children,
  isLoading = false,
  variant = 'gradient',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'relative flex items-center justify-center font-semibold text-center rounded-xl py-3.5 px-6 leading-relaxed transition-all duration-200 select-none overflow-hidden text-sm active:scale-[0.98]';

  const variantClasses = {
    gradient:
      'bg-gradient-to-r from-brand-primary to-[#00D4FF] hover:brightness-110 active:brightness-95 text-white shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    outline:
      'border border-brand-border bg-[#1A1D26]/40 hover:bg-[#1A1D26]/90 hover:border-brand-primary/45 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    ghost:
      'text-brand-text-secondary hover:text-white hover:bg-white/5 cursor-pointer disabled:opacity-50 disabled:active:scale-100',
  };

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2.5">
          <Spinner size="sm" />
          <span className="opacity-85 tracking-wide">Processing...</span>
        </div>
      ) : (
        <span className="flex items-center gap-2">{children}</span>
      )}
    </button>
  );
}
