import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../ui';

interface SuspendReasonModalProps {
  isOpen: boolean;
  targetName: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export function SuspendReasonModal({
  isOpen,
  targetName,
  onConfirm,
  onClose,
  isSubmitting,
}: SuspendReasonModalProps) {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = reason.trim();

    if (!trimmed) {
      setValidationError('Le motif de suspension est obligatoire.');
      return;
    }

    if (trimmed.length < MIN_LENGTH) {
      setValidationError(`Le motif doit contenir au moins ${MIN_LENGTH} caractères.`);
      return;
    }

    setValidationError(null);
    onConfirm(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        Suspendre {targetName}
      </ModalHeader>
      <ModalBody>
        <label htmlFor="suspend-reason" className="block text-sm font-medium text-cream-300 mb-2">
          Motif de la suspension
        </label>
        <textarea
          id="suspend-reason"
          autoFocus
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (validationError) setValidationError(null);
          }}
          maxLength={MAX_LENGTH}
          rows={4}
          placeholder="Expliquez le motif de la suspension…"
          className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 placeholder-cream-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-vertical"
          aria-describedby={validationError ? 'suspend-reason-error' : undefined}
          aria-invalid={validationError ? 'true' : undefined}
        />
        <div className="flex justify-between items-center mt-1">
          {validationError ? (
            <p id="suspend-reason-error" className="text-sm text-error-500" role="alert">
              {validationError}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-cream-600">
            {reason.length}/{MAX_LENGTH}
          </span>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button variant="danger" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
          Confirmer la suspension
        </Button>
      </ModalFooter>
    </Modal>
  );
}
