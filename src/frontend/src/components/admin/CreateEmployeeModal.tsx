import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../ui';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onConfirm: (email: string, password: string) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

type Step = 'form' | 'confirm';

export function CreateEmployeeModal({
  isOpen,
  onConfirm,
  onClose,
  isSubmitting,
}: CreateEmployeeModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const resetForm = () => {
    setStep('form');
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "L'adresse email est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "L'adresse email n'est pas valide.";
    } else if (trimmedEmail.length > 254) {
      newErrors.email = "L'adresse email ne peut pas dépasser 254 caractères.";
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis.';
    } else if (password.length < 12) {
      newErrors.password = 'Le mot de passe doit contenir au moins 12 caractères.';
    } else if (password.length > 128) {
      newErrors.password = 'Le mot de passe ne peut pas dépasser 128 caractères.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) setStep('confirm');
  };

  const handleBack = () => setStep('form');

  const handleConfirm = () => {
    onConfirm(email.trim().toLowerCase(), password);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader onClose={handleClose}>
        Créer un compte employé
      </ModalHeader>

      {step === 'form' ? (
        <>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label htmlFor="employee-email" className="block text-sm font-medium text-cream-300 mb-1">
                  Adresse email
                </label>
                <input
                  id="employee-email"
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="employe@example.com"
                  maxLength={254}
                  className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 placeholder-cream-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  aria-describedby={errors.email ? 'employee-email-error' : undefined}
                  aria-invalid={errors.email ? 'true' : undefined}
                />
                {errors.email && (
                  <p id="employee-email-error" className="mt-1 text-sm text-error-500" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="employee-password" className="block text-sm font-medium text-cream-300 mb-1">
                  Mot de passe
                </label>
                <input
                  id="employee-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Minimum 12 caractères"
                  maxLength={128}
                  className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 placeholder-cream-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  aria-describedby={errors.password ? 'employee-password-error' : undefined}
                  aria-invalid={errors.password ? 'true' : undefined}
                />
                {errors.password && (
                  <p id="employee-password-error" className="mt-1 text-sm text-error-500" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleNext}>
              Suivant
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalBody>
            <div className="space-y-3">
              <p className="text-cream-300">
                Vous allez créer le compte employé suivant :
              </p>
              <div className="bg-dark-900 border border-dark-600 rounded-lg p-4 space-y-2">
                <p className="text-sm text-cream-400">
                  <span className="text-cream-500">Email :</span>{' '}
                  <strong className="text-cream-100">{email.trim().toLowerCase()}</strong>
                </p>
                <p className="text-sm text-cream-400">
                  <span className="text-cream-500">Pseudo :</span>{' '}
                  <strong className="text-cream-100">{email.trim().toLowerCase().split('@')[0]}</strong>
                  <span className="text-cream-600 ml-1">(dérivé de l'email)</span>
                </p>
              </div>
              <p className="text-sm text-cream-500">
                Le pseudo est automatiquement dérivé de l'adresse email.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" size="sm" onClick={handleBack} disabled={isSubmitting}>
              Retour
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirm} isLoading={isSubmitting}>
              Confirmer la création
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
