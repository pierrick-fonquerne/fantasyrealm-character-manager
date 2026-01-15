import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input, PasswordInput, Button, Alert } from '../ui';
import { ChangePasswordModal } from './ChangePasswordModal';
import { authService, type ApiError, type ChangePasswordResponse } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [temporaryToken, setTemporaryToken] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
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
      const response = await authService.login(formData);

      if (response.mustChangePassword) {
        setTemporaryToken(response.token);
        setShowChangePasswordModal(true);
        return;
      }

      login(response);
      onSuccess();
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Une erreur est survenue lors de la connexion');
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

  const handlePasswordChangeSuccess = (response: ChangePasswordResponse) => {
    setShowChangePasswordModal(false);
    setTemporaryToken(null);
    login({
      token: response.token,
      expiresAt: response.expiresAt,
      user: response.user,
      mustChangePassword: false,
    });
    onSuccess();
  };

  return (
    <>
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        token={temporaryToken || ''}
        onSuccess={handlePasswordChangeSuccess}
      />
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

        <PasswordInput
          label="Mot de passe"
          placeholder="Votre mot de passe"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="mt-4 text-right">
        <Link
          to="/forgot-password"
          className="text-sm text-cream-400 hover:text-gold-500 transition-colors"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        className="mt-6"
      >
        Se connecter
      </Button>
    </form>
    </>
  );
};

export { LoginForm };
