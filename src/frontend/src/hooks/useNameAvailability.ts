import { useState, useCallback, useRef, useEffect } from 'react';
import { checkNameAvailability } from '../services/characterService';
import { NAME_ERRORS, NAME_MIN_LENGTH, NAME_MAX_LENGTH } from '../constants';

interface UseNameAvailabilityOptions {
  token: string | null;
  debounceMs?: number;
}

interface UseNameAvailabilityReturn {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
  validate: (name: string) => string;
  checkAvailability: (name: string) => void;
  reset: () => void;
}

/**
 * Validates a character name locally (format validation).
 */
export const validateCharacterName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) {
    return NAME_ERRORS.REQUIRED;
  }
  if (trimmed.length < NAME_MIN_LENGTH) {
    return NAME_ERRORS.TOO_SHORT;
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return NAME_ERRORS.TOO_LONG;
  }
  return '';
};

/**
 * Custom hook for character name validation with availability check.
 * Handles debouncing and API calls for checking name uniqueness.
 */
export const useNameAvailability = ({
  token,
  debounceMs = 500,
}: UseNameAvailabilityOptions): UseNameAvailabilityReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setIsChecking(false);
    setIsAvailable(null);
    setError(null);
  }, []);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const checkAvailability = useCallback(
    (name: string) => {
      // Clear previous timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Reset state if name is invalid
      const validationError = validateCharacterName(name);
      if (validationError) {
        setIsAvailable(null);
        setIsChecking(false);
        setError(null);
        return;
      }

      // Don't check if no token (not logged in)
      if (!token) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      setError(null);

      // Debounce API call
      debounceRef.current = setTimeout(async () => {
        try {
          const response = await checkNameAvailability(name.trim(), token);
          setIsAvailable(response.available);
          if (!response.available) {
            setError(NAME_ERRORS.ALREADY_TAKEN);
          }
        } catch {
          // API error - reset state
          setIsAvailable(null);
          setError(null);
        } finally {
          setIsChecking(false);
        }
      }, debounceMs);
    },
    [token, debounceMs]
  );

  return {
    isChecking,
    isAvailable,
    error,
    validate: validateCharacterName,
    checkAvailability,
    reset,
  };
};
