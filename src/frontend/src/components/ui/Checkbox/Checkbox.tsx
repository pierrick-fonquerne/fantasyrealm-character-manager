import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex flex-col">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={`peer w-5 h-5 bg-dark-700 border border-dark-500 rounded cursor-pointer transition-all duration-200 checked:bg-gold-500 checked:border-gold-500 hover:border-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${error ? 'border-error-500' : ''} ${className}`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={
                error ? `${checkboxId}-error` : hint ? `${checkboxId}-hint` : undefined
              }
              {...props}
            />
            <svg
              className="absolute w-3 h-3 left-1 top-1 text-dark-950 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm text-cream-200 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="mt-1.5 text-sm text-error-500 ml-8"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${checkboxId}-hint`} className="mt-1.5 text-sm text-dark-200 ml-8">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, type CheckboxProps };
