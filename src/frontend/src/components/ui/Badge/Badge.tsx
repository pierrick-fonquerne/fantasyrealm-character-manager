import { type HTMLAttributes, forwardRef } from 'react';

type BadgeVariant =
  | 'default'
  | 'gold'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-dark-500 text-cream-200',
  gold: 'bg-gold-500/30 text-gold-300 border border-gold-500/40',
  success: 'bg-success-500/30 text-success-500 border border-success-500/40',
  error: 'bg-error-500/30 text-error-500 border border-error-500/40',
  warning: 'bg-warning-500/30 text-warning-500 border border-warning-500/40',
  info: 'bg-info-500/30 text-info-500 border border-info-500/40',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize };
