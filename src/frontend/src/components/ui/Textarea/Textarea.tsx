import { type TextareaHTMLAttributes, forwardRef, useId } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const resizeStyles: Record<'none' | 'vertical' | 'horizontal' | 'both', string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      resize = 'vertical',
      id,
      className = '',
      rows = 4,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const baseStyles =
      'bg-dark-700 text-cream-200 border rounded-lg px-4 py-3 transition-all duration-200 placeholder:text-dark-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

    const borderStyles = error
      ? 'border-error-500 focus:ring-error-500'
      : 'border-dark-500 hover:border-dark-400';

    const describedBy = [
      hint && `${textareaId}-hint`,
      error && `${textareaId}-error`,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
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
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          className={`${baseStyles} ${borderStyles} ${resizeStyles[resize]} ${fullWidth ? 'w-full' : ''} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1.5 text-sm text-error-500"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-sm text-dark-200">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps, type TextareaResize };
