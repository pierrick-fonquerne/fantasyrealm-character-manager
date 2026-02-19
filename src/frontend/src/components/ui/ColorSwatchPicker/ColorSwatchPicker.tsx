import { useId } from 'react';
import { isLightColor } from '../../../utils/colorUtils';

export interface ColorSwatchPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  colors: readonly string[];
  error?: string;
  id?: string;
}

export function ColorSwatchPicker({
  label,
  value,
  onChange,
  colors,
  error,
  id: propId,
}: ColorSwatchPickerProps) {
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
        className="flex flex-wrap gap-2"
      >
        {colors.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Couleur ${color}`}
              onClick={() => onChange(color)}
              className={`
                w-9 h-9 rounded-full cursor-pointer transition-all duration-200
                border-3 relative
                hover:scale-110 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-900
                ${isSelected
                  ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'border-transparent'
                }
              `}
              style={{ backgroundColor: color }}
            >
              {isSelected && (
                <>
                  <span
                    className="absolute inset-[-6px] border-2 border-gold-500 rounded-full"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      color: isLightColor(color) ? '#000' : '#fff',
                    }}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                </>
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
