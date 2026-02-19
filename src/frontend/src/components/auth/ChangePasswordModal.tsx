import { useState, type FormEvent } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal/Modal';
import { PasswordInput, Button, Alert } from '../ui';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { authService, type ChangePasswordResponse, type ApiError } from '../../services/authService';
import { validatePassword } from '../../utils/passwordValidation';

interface ChangePasswordModalProps {
  isOpen: boolean;
  token: string;
  onSuccess: (response: ChangePasswordResponse) => void;
}

const ChangePasswordModal = ({ isOpen, token, onSuccess }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else {
      const validation = validatePassword(formData.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = 'Le mot de passe ne respecte pas les critères de sécurité';
      }
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'La confirmation est requise';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'ancien';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.changePassword(formData, token);
      onSuccess(response);
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      size="md"
      closeOnOverlay={false}
      closeOnEscape={false}
    >
      <ModalHeader showCloseButton={false}>
        Changement de mot de passe obligatoire
      </ModalHeader>

      <form onSubmit={handleSubmit} noValidate>
        <ModalBody>
          <p className="text-cream-300 mb-6">
            Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.
          </p>

          {apiError && (
            <Alert variant="error" className="mb-6" onClose={() => setApiError(null)}>
              {apiError}
            </Alert>
          )}

          <div className="space-y-5">
            <PasswordInput
              label="Mot de passe actuel"
              placeholder="Votre mot de passe temporaire"
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              error={errors.currentPassword}
              autoComplete="current-password"
              required
            />

            <div>
              <PasswordInput
                label="Nouveau mot de passe"
                placeholder="Votre nouveau mot de passe"
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                error={errors.newPassword}
                autoComplete="new-password"
                required
              />
              <PasswordStrengthIndicator password={formData.newPassword} />
            </div>

            <PasswordInput
              label="Confirmer le nouveau mot de passe"
              placeholder="Confirmez votre nouveau mot de passe"
              value={formData.confirmNewPassword}
              onChange={handleChange('confirmNewPassword')}
              error={errors.confirmNewPassword}
              autoComplete="new-password"
              required
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Changer mon mot de passe
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export { ChangePasswordModal };
