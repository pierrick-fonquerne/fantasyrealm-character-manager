import type { ReactNode } from 'react';
import type { CharacterClass } from '../../../services/referenceDataService';

interface ClassSelectorProps {
  label: string;
  value: number;
  onChange: (classId: number) => void;
  classes: CharacterClass[];
  error?: string;
}

const CLASS_ICONS: Record<string, ReactNode> = {
  Guerrier: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M12 2L9 9H2l6 5-2 8 6-4 6 4-2-8 6-5h-7L12 2z" opacity="0.3" />
      <path d="M14.5 3.5L12 1 9.5 3.5 12 6l2.5-2.5zM6.5 9l-1 4h2l-1-4zm12 0l-1 4h2l-1-4zM12 8l-2 6h4l-2-6zm-1 8v5l1 2 1-2v-5h-2z" />
    </svg>
  ),
  Mage: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M12 2l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" />
      <path d="M7 9l.5 2 2 .5-2 .5L7 14l-.5-2-2-.5 2-.5L7 9z" opacity="0.7" />
      <path d="M17 9l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" opacity="0.7" />
      <path d="M10 14h4l1 8H9l1-8z" opacity="0.5" />
      <path d="M11 15h2v7h-2z" />
    </svg>
  ),
  Archer: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M4 2v20l2-2 2 2 2-2 2 2V2L10 4 8 2 6 4 4 2z" opacity="0.3" />
      <path d="M20 12l-8-4v3H4v2h8v3l8-4z" />
      <path d="M3 8v8l1-1V9L3 8z" opacity="0.5" />
    </svg>
  ),
  Voleur: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M12 2L8 6l4 2 4-2-4-4z" opacity="0.3" />
      <path d="M9 8l-2 12h2l1-8 2 2 2-2 1 8h2L15 8l-3 2-3-2z" />
      <path d="M6 10l-2 4 3-1-1-3z" opacity="0.5" />
      <path d="M18 10l2 4-3-1 1-3z" opacity="0.5" />
    </svg>
  ),
};

const ClassSelector = ({ label, value, onChange, classes, error }: ClassSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-cream-300 mb-3">
        {label}
      </label>
      <div
        className="grid grid-cols-2 gap-3"
        role="radiogroup"
        aria-label={label}
      >
        {classes.map((characterClass) => {
          const isSelected = value === characterClass.id;
          const Icon = CLASS_ICONS[characterClass.name];

          return (
            <button
              key={characterClass.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(characterClass.id)}
              className={`
                group relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer
                ${isSelected
                  ? 'border-gold-500 bg-gradient-to-br from-gold-500/15 to-gold-600/5 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                  : 'border-dark-600 bg-dark-800/50 hover:border-gold-500/50 hover:bg-dark-700/70 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200
                ${isSelected
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'bg-dark-700 text-cream-500 group-hover:bg-gold-500/10 group-hover:text-gold-400/70'
                }
              `}>
                {characterClass.iconUrl ? (
                  <img
                    src={characterClass.iconUrl}
                    alt=""
                    className="w-8 h-8 object-contain"
                  />
                ) : Icon ? (
                  Icon
                ) : (
                  <span className="text-xl font-bold">
                    {characterClass.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-semibold ${isSelected ? 'text-gold-400' : 'text-cream-200'}`}>
                  {characterClass.name}
                </span>
                {characterClass.description && (
                  <span className="block text-xs text-cream-500 mt-0.5 line-clamp-2">
                    {characterClass.description}
                  </span>
                )}
              </div>

              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                  <span className="text-dark-950 text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export { ClassSelector };
