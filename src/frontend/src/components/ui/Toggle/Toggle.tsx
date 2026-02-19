import { type InputHTMLAttributes, forwardRef, useId } from 'react';

type ToggleSize = 'sm' | 'md' | 'lg';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: ToggleSize;
  error?: string;
}

const sizeStyles: Record<ToggleSize, { track: string; thumb: string; translate: string }> = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'peer-checked:translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'peer-checked:translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'peer-checked:translate-x-7',
  },
};

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, size = 'md', error, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const toggleId = id || generatedId;
    const styles = sizeStyles[size];

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <label htmlFor={toggleId} className="relative inline-flex cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="peer sr-only"
            aria-describedby={
              description ? `${toggleId}-description` : error ? `${toggleId}-error` : undefined
            }
            {...props}
          />
          <div
            className={`${styles.track} bg-dark-600 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-500 peer-focus:ring-offset-2 peer-focus:ring-offset-dark-900 peer-checked:bg-gold-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-colors duration-200`}
          />
          <div
            className={`absolute left-0.5 top-0.5 ${styles.thumb} bg-dark-200 rounded-full transition-all duration-200 peer-checked:bg-dark-950 ${styles.translate}`}
          />
        </label>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={toggleId}
                className="text-sm font-medium text-cream-200 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${toggleId}-description`}
                className="text-sm text-dark-200 mt-0.5"
              >
                {description}
              </p>
            )}
            {error && (
              <p
                id={`${toggleId}-error`}
                className="text-sm text-error-500 mt-1"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle, type ToggleProps, type ToggleSize };
