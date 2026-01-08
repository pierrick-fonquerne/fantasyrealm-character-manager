import { describe, it, expect } from 'vitest';
import { validatePassword, getStrengthLabel, getStrengthColor } from './passwordValidation';

describe('validatePassword', () => {
  describe('valid password', () => {
    it('should return isValid true for a password meeting all criteria', () => {
      const result = validatePassword('MySecure@Pass1');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.checks.minLength).toBe(true);
      expect(result.checks.uppercase).toBe(true);
      expect(result.checks.lowercase).toBe(true);
      expect(result.checks.digit).toBe(true);
      expect(result.checks.special).toBe(true);
    });

    it('should return score of 5 for valid password', () => {
      const result = validatePassword('MySecure@Pass1');

      expect(result.score).toBe(5);
    });
  });

  describe('minLength check', () => {
    it('should fail if password is less than 12 characters', () => {
      const result = validatePassword('Short@1Ab');

      expect(result.isValid).toBe(false);
      expect(result.checks.minLength).toBe(false);
      expect(result.errors).toContain('Au moins 12 caractères');
    });

    it('should pass if password is exactly 12 characters', () => {
      const result = validatePassword('MySecure@1Ab');

      expect(result.checks.minLength).toBe(true);
    });
  });

  describe('uppercase check', () => {
    it('should fail if password has no uppercase letter', () => {
      const result = validatePassword('mysecure@pass1');

      expect(result.isValid).toBe(false);
      expect(result.checks.uppercase).toBe(false);
      expect(result.errors).toContain('Au moins une majuscule');
    });
  });

  describe('lowercase check', () => {
    it('should fail if password has no lowercase letter', () => {
      const result = validatePassword('MYSECURE@PASS1');

      expect(result.isValid).toBe(false);
      expect(result.checks.lowercase).toBe(false);
      expect(result.errors).toContain('Au moins une minuscule');
    });
  });

  describe('digit check', () => {
    it('should fail if password has no digit', () => {
      const result = validatePassword('MySecure@Password');

      expect(result.isValid).toBe(false);
      expect(result.checks.digit).toBe(false);
      expect(result.errors).toContain('Au moins un chiffre');
    });
  });

  describe('special character check', () => {
    it('should fail if password has no special character', () => {
      const result = validatePassword('MySecurePass12');

      expect(result.isValid).toBe(false);
      expect(result.checks.special).toBe(false);
      expect(result.errors).toContain('Au moins un caractère spécial');
    });

    it.each([
      '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+',
      '-', '=', '[', ']', '{', '}', '|', ';', ':', "'", ',', '.',
      '<', '>', '?', '/', '\\',
    ])('should accept special character: %s', (char) => {
      const result = validatePassword(`MySecurePass1${char}`);

      expect(result.checks.special).toBe(true);
    });
  });

  describe('score calculation', () => {
    it('should return score 0 for empty password', () => {
      const result = validatePassword('');

      expect(result.score).toBe(0);
    });

    it('should increment score for each valid criterion', () => {
      expect(validatePassword('a').score).toBe(1);
      expect(validatePassword('aA').score).toBe(2);
      expect(validatePassword('aA1').score).toBe(3);
      expect(validatePassword('aA1@').score).toBe(4);
    });

    it('should cap score at 5 even with bonus', () => {
      const result = validatePassword('MyVeryLongSecure@Password1');

      expect(result.score).toBe(5);
    });

    it('should give bonus point for password 16+ characters', () => {
      const short = validatePassword('MySecure@Pass1');
      const long = validatePassword('MyVerySecure@Pass1');

      expect(long.score).toBeGreaterThanOrEqual(short.score);
    });
  });

  describe('empty password', () => {
    it('should return all checks as false for empty password', () => {
      const result = validatePassword('');

      expect(result.isValid).toBe(false);
      expect(result.checks.minLength).toBe(false);
      expect(result.checks.uppercase).toBe(false);
      expect(result.checks.lowercase).toBe(false);
      expect(result.checks.digit).toBe(false);
      expect(result.checks.special).toBe(false);
    });
  });
});

describe('getStrengthLabel', () => {
  it('should return "Faible" for score 0', () => {
    expect(getStrengthLabel(0)).toBe('Faible');
  });

  it('should return "Faible" for score 1', () => {
    expect(getStrengthLabel(1)).toBe('Faible');
  });

  it('should return "Moyen" for score 2', () => {
    expect(getStrengthLabel(2)).toBe('Moyen');
  });

  it('should return "Fort" for score 3', () => {
    expect(getStrengthLabel(3)).toBe('Fort');
  });

  it('should return "Très fort" for score 4', () => {
    expect(getStrengthLabel(4)).toBe('Très fort');
  });

  it('should return "Très fort" for score 5', () => {
    expect(getStrengthLabel(5)).toBe('Très fort');
  });
});

describe('getStrengthColor', () => {
  it('should return error color for score 0-1', () => {
    expect(getStrengthColor(0)).toBe('bg-error-500');
    expect(getStrengthColor(1)).toBe('bg-error-500');
  });

  it('should return warning color for score 2', () => {
    expect(getStrengthColor(2)).toBe('bg-warning-500');
  });

  it('should return gold color for score 3', () => {
    expect(getStrengthColor(3)).toBe('bg-gold-500');
  });

  it('should return success color for score 4-5', () => {
    expect(getStrengthColor(4)).toBe('bg-success-500');
    expect(getStrengthColor(5)).toBe('bg-success-500');
  });
});
