import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: readonly {
    readonly value: string;
    readonly label: string;
    readonly disabled?: boolean;
  }[];
  error?: string;
  hint?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="radio"
              id={radioId}
              className={`peer w-5 h-5 bg-dark-700 border-2 border-dark-500 rounded-full cursor-pointer transition-all duration-200 checked:border-gold-500 hover:border-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${error ? 'border-error-500' : ''} ${className}`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={
                error ? `${radioId}-error` : hint ? `${radioId}-hint` : undefined
              }
              {...props}
            />
            <div className="absolute w-2.5 h-2.5 left-[5px] top-[5px] bg-gold-500 rounded-full pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          {label && (
            <label
              htmlFor={radioId}
              className="text-sm text-cream-200 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p
            id={`${radioId}-error`}
            className="mt-1.5 text-sm text-error-500 ml-8"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${radioId}-hint`} className="mt-1.5 text-sm text-dark-200 ml-8">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

const RadioGroup = ({
  name,
  value,
  onChange,
  options,
  error,
  hint,
  orientation = 'vertical',
  label,
}: RadioGroupProps) => {
  const groupId = useId();

  return (
    <div role="radiogroup" aria-labelledby={label ? `${groupId}-label` : undefined}>
      {label && (
        <p id={`${groupId}-label`} className="text-sm font-medium text-cream-200 mb-3">
          {label}
        </p>
      )}
      <div
        className={`flex ${orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-4'}`}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-2 text-sm text-dark-200">{hint}</p>
      )}
    </div>
  );
};

Radio.displayName = 'Radio';

export { Radio, RadioGroup, type RadioProps, type RadioGroupProps };
