import { useMemo } from 'react';
import { validatePassword, getStrengthLabel, getStrengthColor } from '../../utils/passwordValidation';
import { CheckIcon, CircleIcon } from '../icons';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface CriteriaItemProps {
  isValid: boolean;
  label: string;
}

const CriteriaItem = ({ isValid, label }: CriteriaItemProps) => (
  <li className={`flex items-center gap-2 ${isValid ? 'text-success-500' : 'text-cream-400'}`}>
    {isValid ? (
      <CheckIcon className="w-4 h-4 flex-shrink-0" />
    ) : (
      <CircleIcon className="w-4 h-4 flex-shrink-0" />
    )}
    <span>{label}</span>
  </li>
);

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const validation = useMemo(() => validatePassword(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(validation.score)}`}
            style={{ width: `${(validation.score / 5) * 100}%` }}
            role="progressbar"
            aria-valuenow={validation.score}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label="Force du mot de passe"
          />
        </div>
        <span
          className={`text-sm font-medium min-w-[80px] text-right ${
            validation.score <= 1
              ? 'text-error-500'
              : validation.score <= 2
              ? 'text-warning-500'
              : validation.score <= 3
              ? 'text-gold-500'
              : 'text-success-500'
          }`}
        >
          {getStrengthLabel(validation.score)}
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
        <CriteriaItem isValid={validation.checks.minLength} label="12 caractères min." />
        <CriteriaItem isValid={validation.checks.uppercase} label="Une majuscule" />
        <CriteriaItem isValid={validation.checks.lowercase} label="Une minuscule" />
        <CriteriaItem isValid={validation.checks.digit} label="Un chiffre" />
        <CriteriaItem isValid={validation.checks.special} label="Un caractère spécial" />
      </ul>
    </div>
  );
};

export { PasswordStrengthIndicator };
