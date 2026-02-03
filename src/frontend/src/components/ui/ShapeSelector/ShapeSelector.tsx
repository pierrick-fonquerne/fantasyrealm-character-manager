import { useId, type ReactNode } from 'react';

export interface ShapeOption {
  id: string;
  label: string;
  preview: ReactNode;
}

export interface ShapeSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ShapeOption[];
  error?: string;
  columns?: 3 | 4 | 5 | 6;
  id?: string;
}

const GRID_COLS_MAP: Record<3 | 4 | 5 | 6, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

export function ShapeSelector({
  label,
  value,
  onChange,
  options,
  error,
  columns = 4,
  id: propId,
}: ShapeSelectorProps) {
  const generatedId = useId();
  const id = propId || generatedId;

  return (
    <div className="space-y-2">
      <label id={`${id}-label`} className="block text-sm font-medium text-cream-200">
        {label}
      </label>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className={`grid ${GRID_COLS_MAP[columns]} gap-2`}
      >
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              onClick={() => onChange(option.id)}
              className={`
                flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all duration-200
                border-2 relative
                hover:border-gold-600 hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-900
                ${isSelected
                  ? 'border-gold-500 bg-dark-700 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'border-dark-600 bg-dark-800'
                }
              `}
            >
              {/* Preview */}
              <div className="w-10 h-10 flex items-center justify-center">
                {option.preview}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-medium leading-tight text-center ${
                isSelected ? 'text-gold-400' : 'text-cream-500'
              }`}>
                {option.label}
              </span>

              {/* Checkmark */}
              {isSelected && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center text-[8px] text-dark-950 font-bold"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
