import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui';
import { useNameAvailability, validateCharacterName } from '../../hooks/useNameAvailability';

interface DuplicateModalProps {
  isOpen: boolean;
  characterName: string;
  token: string | null;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  isDuplicating?: boolean;
}

export function DuplicateModal({
  isOpen,
  characterName,
  token,
  onConfirm,
  onCancel,
  isDuplicating = false,
}: DuplicateModalProps) {
  const [newName, setNewName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    isChecking,
    isAvailable,
    error: availabilityError,
    checkAvailability,
    reset,
  } = useNameAvailability({ token });

  // Reset form state when modal opens - this is intentional synchronization with props
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting form when modal opens is valid
      setNewName(`${characterName} (copie)`);
      setLocalError(null);
      reset();
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, characterName, reset]);

  // Check availability when name changes
  useEffect(() => {
    if (isOpen && newName.trim()) {
      const validationError = validateCharacterName(newName);
      if (!validationError) {
        checkAvailability(newName);
      }
    }
  }, [newName, isOpen, checkAvailability]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newName.trim();
    const validationError = validateCharacterName(trimmedName);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    if (isAvailable === false) {
      setLocalError('Ce nom est déjà pris');
      return;
    }

    if (isChecking) {
      return;
    }

    onConfirm(trimmedName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewName(value);
    setLocalError(null);
  };

  const canSubmit =
    !isDuplicating &&
    !isChecking &&
    newName.trim().length >= 2 &&
    isAvailable !== false &&
    !localError;

  // Restore focus on close
  const triggerRef = useRef<Element | null>(null);
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  if (!isOpen) return null;

  const displayError = localError || availabilityError;
  const feedbackId = 'duplicate-name-feedback';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-modal-title"
    >
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gold-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2
              id="duplicate-modal-title"
              className="text-lg font-semibold text-cream-100"
            >
              Dupliquer le personnage
            </h2>
            <p className="text-sm text-cream-400 mt-1">
              Créez une copie de{' '}
              <span className="text-gold-400 font-medium">{characterName}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="duplicate-name"
              className="block text-sm font-medium text-cream-200 mb-2"
            >
              Nom du nouveau personnage
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="duplicate-name"
                type="text"
                value={newName}
                onChange={handleNameChange}
                disabled={isDuplicating}
                aria-describedby={feedbackId}
                aria-invalid={!!displayError}
                className={`w-full px-4 py-3 pr-10 bg-dark-700 border rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors ${
                  displayError
                    ? 'border-error-500'
                    : isAvailable === true
                    ? 'border-success-500'
                    : 'border-dark-500'
                }`}
                placeholder="Entrez un nom unique"
                maxLength={50}
              />
              {isChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-cream-500"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}
              {!isChecking && isAvailable === true && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-success-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {!isChecking && isAvailable === false && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-error-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            <div id={feedbackId} aria-live="polite">
              {displayError && (
                <p className="mt-2 text-sm text-error-400">{displayError}</p>
              )}
              {isAvailable === true && !displayError && (
                <p className="mt-2 text-sm text-success-400">
                  Ce nom est disponible
                </p>
              )}
              {isChecking && (
                <p className="mt-2 text-sm text-cream-500 sr-only">Vérification en cours...</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isDuplicating}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit}
              isLoading={isDuplicating}
            >
              {isDuplicating ? 'Duplication...' : 'Dupliquer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
