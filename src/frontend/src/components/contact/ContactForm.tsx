import { useState, useEffect, type FormEvent } from 'react';
import { Input, Button, Alert, Textarea } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { contactService } from '../../services/contactService';
import type { ApiError } from '../../services/authService';

const ContactForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    pseudo: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        pseudo: user.pseudo,
      }));
    }
  }, [isAuthenticated, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.pseudo.trim()) {
      newErrors.pseudo = 'Le pseudo est requis';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Le message doit contenir au moins 20 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
      if (apiError) {
        setApiError(null);
      }
      if (successMessage) {
        setSuccessMessage(null);
      }
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await contactService.sendMessage(formData);
      setSuccessMessage(response.message);
      if (!isAuthenticated) {
        setFormData({ email: '', pseudo: '', message: '' });
      } else {
        setFormData((prev) => ({ ...prev, message: '' }));
      }
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || "Une erreur est survenue lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && (
        <Alert variant="error" className="mb-6" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
          {successMessage}
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
          disabled={isAuthenticated}
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
          disabled={isAuthenticated}
        />

        <Textarea
          label="Message"
          placeholder="Décrivez votre demande en détail (minimum 20 caractères)"
          value={formData.message}
          onChange={handleChange('message')}
          error={errors.message}
          rows={6}
          required
          hint="Minimum 20 caractères"
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
        Envoyer le message
      </Button>
    </form>
  );
};

export { ContactForm };
