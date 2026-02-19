import { useState, type FormEvent } from 'react';
import { Input, PasswordInput, Button, Alert } from '../ui';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { validatePassword } from '../../utils/passwordValidation';
import { authService, type ApiError } from '../../services/authService';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    pseudo: '',
    password: '',
    confirmPassword: '',
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
    } else if (formData.pseudo.trim().length < 3) {
      newErrors.pseudo = 'Le pseudo doit contenir au moins 3 caractères';
    } else if (formData.pseudo.trim().length > 30) {
      newErrors.pseudo = 'Le pseudo ne peut pas dépasser 30 caractères';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Le mot de passe ne respecte pas les critères de sécurité';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
      await authService.register(formData);
      onSuccess();
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Une erreur est survenue lors de l\'inscription');
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
          placeholder="Pseudonyme de votre compte"
          value={formData.pseudo}
          onChange={handleChange('pseudo')}
          error={errors.pseudo}
          autoComplete="username"
          required
          hint="3 à 30 caractères"
        />

        <div>
          <PasswordInput
            label="Mot de passe"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <PasswordInput
          label="Confirmer le mot de passe"
          placeholder="••••••••••••"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        className="mt-8"
      >
        Créer mon compte
      </Button>
    </form>
  );
};

export { RegisterForm };
