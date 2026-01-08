interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  checks: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    digit: boolean;
    special: boolean;
  };
}

const PASSWORD_MIN_LENGTH = 12;

// Aligned with backend PasswordValidator.cs - same special characters accepted
// eslint-disable-next-line no-useless-escape
const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/\\]/;

const validatePassword = (password: string): ValidationResult => {
  const checks = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: SPECIAL_CHARS_REGEX.test(password),
  };

  const errors: string[] = [];
  if (!checks.minLength) errors.push('Au moins 12 caractères');
  if (!checks.uppercase) errors.push('Au moins une majuscule');
  if (!checks.lowercase) errors.push('Au moins une minuscule');
  if (!checks.digit) errors.push('Au moins un chiffre');
  if (!checks.special) errors.push('Au moins un caractère spécial');

  let score = 0;
  if (checks.minLength) score++;
  if (checks.uppercase) score++;
  if (checks.lowercase) score++;
  if (checks.digit) score++;
  if (checks.special) score++;
  if (password.length >= 16) score++;

  return {
    isValid: errors.length === 0,
    score: Math.min(score, 5),
    errors,
    checks,
  };
};

const getStrengthLabel = (score: number): string => {
  if (score <= 1) return 'Faible';
  if (score <= 2) return 'Moyen';
  if (score <= 3) return 'Fort';
  return 'Très fort';
};

const getStrengthColor = (score: number): string => {
  if (score <= 1) return 'bg-error-500';
  if (score <= 2) return 'bg-warning-500';
  if (score <= 3) return 'bg-gold-500';
  return 'bg-success-500';
};

export { validatePassword, getStrengthLabel, getStrengthColor };
export type { ValidationResult };
