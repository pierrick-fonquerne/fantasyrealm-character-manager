import type { CharacterClass } from '../../../services/referenceDataService';
import { CLASS_ICONS } from '../icons';

interface ClassSelectorProps {
  label: string;
  value: number;
  onChange: (classId: number) => void;
  classes: CharacterClass[];
  error?: string;
}

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
