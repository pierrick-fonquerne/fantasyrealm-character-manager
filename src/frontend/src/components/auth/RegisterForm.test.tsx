import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RegisterForm } from './RegisterForm';
import { authService } from '../../services/authService';

expect.extend(toHaveNoViolations);

vi.mock('../../services/authService', () => ({
  authService: {
    register: vi.fn(),
  },
}));

const mockRegister = vi.mocked(authService.register);

describe('RegisterForm', () => {
  const mockOnSuccess = vi.fn();
  const validFormData = {
    email: 'test@example.com',
    pseudo: 'TestUser',
    password: 'MySecure@Pass1',
    confirmPassword: 'MySecure@Pass1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pseudo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^mot de passe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
    });

    it('should have noValidate attribute on form', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      const form = screen.getByRole('button', { name: /créer mon compte/i }).closest('form');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('validation', () => {
    it('should show error when email is empty', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
    });

    it('should show error when email format is invalid', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'invalid-email');
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(screen.getByText(/l'email n'est pas valide/i)).toBeInTheDocument();
    });

    it('should show error when pseudo is empty', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(screen.getByText(/le pseudo est requis/i)).toBeInTheDocument();
    });

    it('should show error when pseudo is too short', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/pseudo/i), 'ab');
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(screen.getByText(/le pseudo doit contenir au moins 3 caractères/i)).toBeInTheDocument();
    });

    it('should show error when pseudo is too long', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/pseudo/i), 'a'.repeat(31));
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(screen.getByText(/le pseudo ne peut pas dépasser 30 caractères/i)).toBeInTheDocument();
    });

    it('should show error when password does not meet security criteria', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/^mot de passe/i), 'weak');
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(screen.getByText(/le mot de passe ne respecte pas les critères de sécurité/i)).toBeInTheDocument();
    });

    it('should show error when passwords do not match', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/^mot de passe/i), 'MySecure@Pass1');
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'DifferentPass@1');
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });

    it('should clear field error when user starts typing', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'a');

      expect(screen.queryByText(/l'email est requis/i)).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should not submit form if validation fails', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should call authService.register with form data on valid submission', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: validFormData.email,
        pseudo: validFormData.pseudo,
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: validFormData.email,
          pseudo: validFormData.pseudo,
          password: validFormData.password,
          confirmPassword: validFormData.confirmPassword,
        });
      });
    });

    it('should call onSuccess callback after successful registration', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: validFormData.email,
        pseudo: validFormData.pseudo,
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state while submitting', async () => {
      mockRegister.mockImplementation(() => new Promise(() => {}));

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);

      fireEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /chargement/i })).toBeDisabled();
      });
    });
  });

  describe('API error handling', () => {
    it('should display API error message on registration failure', async () => {
      mockRegister.mockRejectedValueOnce({
        message: 'Cette adresse email est déjà utilisée.',
        status: 409,
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/cette adresse email est déjà utilisée/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message when API returns no message', async () => {
      mockRegister.mockRejectedValueOnce({
        status: 500,
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
      });
    });

    it('should clear API error when user starts typing', async () => {
      mockRegister.mockRejectedValueOnce({
        message: 'Cette adresse email est déjà utilisée.',
        status: 409,
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/cette adresse email est déjà utilisée/i)).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'a');

      expect(screen.queryByText(/cette adresse email est déjà utilisée/i)).not.toBeInTheDocument();
    });

    it('should allow closing API error alert', async () => {
      mockRegister.mockRejectedValueOnce({
        message: 'Cette adresse email est déjà utilisée.',
        status: 409,
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/cette adresse email est déjà utilisée/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /fermer/i });
      await userEvent.click(closeButton);

      expect(screen.queryByText(/cette adresse email est déjà utilisée/i)).not.toBeInTheDocument();
    });
  });

  describe('password strength indicator', () => {
    it('should display password strength indicator when typing password', async () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/^mot de passe/i), 'test');

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should not display password strength indicator for empty password', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations on initial render', async () => {
      const { container } = render(<RegisterForm onSuccess={mockOnSuccess} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with validation errors', async () => {
      const { container } = render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with API error', async () => {
      mockRegister.mockRejectedValueOnce({
        message: 'Cette adresse email est déjà utilisée.',
        status: 409,
      });

      const { container } = render(<RegisterForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/pseudo/i), 'TestUser');
      await userEvent.type(screen.getByLabelText(/^mot de passe/i), 'MySecure@Pass1');
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'MySecure@Pass1');
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/cette adresse email est déjà utilisée/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
