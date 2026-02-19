import { type InputHTMLAttributes, forwardRef, useId } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: InputSize;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      inputSize = 'md',
      fullWidth = true,
      id,
      className = '',
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseStyles =
      'bg-dark-700 text-cream-200 border rounded-lg transition-all duration-200 placeholder:text-dark-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

    const borderStyles = error
      ? 'border-error-500 focus:ring-error-500'
      : 'border-dark-500 hover:border-dark-400';

    const describedBy = [
      hint && `${inputId}-hint`,
      error && `${inputId}-error`,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-cream-200 mb-1.5"
          >
            {label}
            {required && (
              <>
                <span aria-hidden="true" className="text-error-500 ml-0.5">*</span>
                <span className="sr-only"> (obligatoire)</span>
              </>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`${baseStyles} ${borderStyles} ${sizeStyles[inputSize]} ${fullWidth ? 'w-full' : ''} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-error-500"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-dark-200">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps, type InputSize };
