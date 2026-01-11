import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from './LoginForm';
import { authService } from '../../services/authService';

expect.extend(toHaveNoViolations);

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

const mockAuthLogin = vi.mocked(authService.login);

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();
  const validFormData = {
    email: 'test@example.com',
    password: 'MySecure@Pass1',
  };

  const mockLoginResponse = {
    token: 'jwt-token-here',
    expiresAt: '2024-12-31T23:59:59Z',
    user: {
      id: 1,
      email: 'test@example.com',
      pseudo: 'TestUser',
      role: 'User',
    },
    mustChangePassword: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('button', { name: /mot de passe oublié/i })).toBeInTheDocument();
    });

    it('should have noValidate attribute on form', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const form = screen.getByRole('button', { name: /se connecter/i }).closest('form');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('validation', () => {
    it('should show error when email is empty', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
    });

    it('should show error when email format is invalid', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'invalid-email');
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(screen.getByText(/l'email n'est pas valide/i)).toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
    });

    it('should clear password error when user starts typing', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), 'a');

      expect(screen.queryByText(/le mot de passe est requis/i)).not.toBeInTheDocument();
    });

    it('should clear field error when user starts typing', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'a');

      expect(screen.queryByText(/l'email est requis/i)).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should not submit form if validation fails', async () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(mockAuthLogin).not.toHaveBeenCalled();
    });

    it('should call authService.login with form data on valid submission', async () => {
      mockAuthLogin.mockResolvedValueOnce(mockLoginResponse);

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockAuthLogin).toHaveBeenCalledWith({
          email: validFormData.email,
          password: validFormData.password,
        });
      });
    });

    it('should call login from auth context after successful login', async () => {
      mockAuthLogin.mockResolvedValueOnce(mockLoginResponse);

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(mockLoginResponse);
      });
    });

    it('should call onSuccess callback after successful login', async () => {
      mockAuthLogin.mockResolvedValueOnce(mockLoginResponse);

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state while submitting', async () => {
      mockAuthLogin.mockImplementation(() => new Promise(() => {}));

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);

      fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /chargement/i })).toBeDisabled();
      });
    });
  });

  describe('API error handling', () => {
    it('should display API error message on login failure', async () => {
      mockAuthLogin.mockRejectedValueOnce({
        message: 'Identifiants incorrects.',
        status: 401,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument();
      });
    });

    it('should display suspended account message', async () => {
      mockAuthLogin.mockRejectedValueOnce({
        message: 'Votre compte a été suspendu.',
        status: 403,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/votre compte a été suspendu/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message when API returns no message', async () => {
      mockAuthLogin.mockRejectedValueOnce({
        status: 500,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/une erreur est survenue lors de la connexion/i)).toBeInTheDocument();
      });
    });

    it('should clear API error when user starts typing', async () => {
      mockAuthLogin.mockRejectedValueOnce({
        message: 'Identifiants incorrects.',
        status: 401,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'a');

      expect(screen.queryByText(/identifiants incorrects/i)).not.toBeInTheDocument();
    });

    it('should allow closing API error alert', async () => {
      mockAuthLogin.mockRejectedValueOnce({
        message: 'Identifiants incorrects.',
        status: 401,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /fermer/i });
      await userEvent.click(closeButton);

      expect(screen.queryByText(/identifiants incorrects/i)).not.toBeInTheDocument();
    });
  });

  describe('MustChangePassword handling', () => {
    it('should display message when mustChangePassword is true', async () => {
      mockAuthLogin.mockResolvedValueOnce({
        ...mockLoginResponse,
        mustChangePassword: true,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/vous devez changer votre mot de passe/i)).toBeInTheDocument();
      });
    });

    it('should not call onSuccess when mustChangePassword is true', async () => {
      mockAuthLogin.mockResolvedValueOnce({
        ...mockLoginResponse,
        mustChangePassword: true,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/vous devez changer votre mot de passe/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should not call login from auth context when mustChangePassword is true', async () => {
      mockAuthLogin.mockResolvedValueOnce({
        ...mockLoginResponse,
        mustChangePassword: true,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/vous devez changer votre mot de passe/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations on initial render', async () => {
      const { container } = render(<LoginForm onSuccess={mockOnSuccess} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with validation errors', async () => {
      const { container } = render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with API error', async () => {
      mockAuthLogin.mockRejectedValueOnce({
        message: 'Identifiants incorrects.',
        status: 401,
      });

      const { container } = render(<LoginForm onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), 'SomePassword1!');
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
