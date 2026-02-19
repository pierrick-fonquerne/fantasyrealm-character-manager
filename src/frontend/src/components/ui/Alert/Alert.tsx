import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant: AlertVariant;
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string }> = {
  success: {
    container: 'bg-success-500/10 border-success-500/30 text-success-500',
    icon: 'text-success-500',
  },
  warning: {
    container: 'bg-warning-500/10 border-warning-500/30 text-warning-500',
    icon: 'text-warning-500',
  },
  error: {
    container: 'bg-error-500/10 border-error-500/30 text-error-500',
    icon: 'text-error-500',
  },
  info: {
    container: 'bg-info-500/10 border-info-500/30 text-info-500',
    icon: 'text-info-500',
  },
};

const defaultIcons: Record<AlertVariant, ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const variantRoles: Record<AlertVariant, string> = {
  error: 'alert',
  warning: 'alert',
  success: 'status',
  info: 'status',
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant, title, icon, onClose, className = '', children, ...props }, ref) => {
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        role={variantRoles[variant]}
        className={`flex gap-3 p-4 border rounded-lg ${styles.container} ${className}`}
        {...props}
      >
        <span className={`flex-shrink-0 ${styles.icon}`} aria-hidden="true">
          {icon || defaultIcons[variant]}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold text-cream-100 mb-1">{title}</p>
          )}
          <div className="text-sm text-cream-200">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-1.5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert, type AlertProps, type AlertVariant };
