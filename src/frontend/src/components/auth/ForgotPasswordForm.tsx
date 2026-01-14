import { useState, type FormEvent } from 'react';
import { Input, Button, Alert } from '../ui';
import { authService, type ApiError } from '../../services/authService';

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    pseudo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.pseudo.trim()) {
      newErrors.pseudo = 'Le pseudo est requis';
    } else if (formData.pseudo.length < 3) {
      newErrors.pseudo = 'Le pseudo doit contenir au moins 3 caractères';
    } else if (formData.pseudo.length > 30) {
      newErrors.pseudo = 'Le pseudo ne doit pas dépasser 30 caractères';
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
      await authService.forgotPassword(formData);
      onSuccess();
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Une erreur est survenue');
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
    <form onSubmit={handleSubmit} noValidate>
      {apiError && (
        <Alert variant="error" className="mb-6" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <div className="space-y-5">
        <Input
          type="email"
          label="Adresse email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
          required
        />

        <Input
          type="text"
          label="Pseudo"
          placeholder="Votre pseudo"
          value={formData.pseudo}
          onChange={handleChange('pseudo')}
          error={errors.pseudo}
          autoComplete="username"
          required
        />
      </div>

      <p className="mt-4 text-sm text-cream-400">
        Un nouveau mot de passe temporaire sera envoyé à votre adresse email.
      </p>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        className="mt-6"
      >
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
};

export { ForgotPasswordForm };
