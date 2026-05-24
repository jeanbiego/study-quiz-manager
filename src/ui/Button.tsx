import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'md' | 'sm' | 'icon';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-slate-950 text-white shadow-sm shadow-slate-300 hover:bg-slate-800',
  secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white shadow-sm shadow-rose-100 hover:bg-rose-500',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'min-h-10 px-3 py-2',
  sm: 'min-h-9 px-3 py-1.5',
  icon: 'h-9 w-9 p-0',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
