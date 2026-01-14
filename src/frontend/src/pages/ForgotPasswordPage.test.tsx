import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ForgotPasswordPage from './ForgotPasswordPage';
import { authService } from '../services/authService';

expect.extend(toHaveNoViolations);

vi.mock('../services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockForgotPassword = vi.mocked(authService.forgotPassword);

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderWithRouter(<ForgotPasswordPage />);

      expect(screen.getByRole('heading', { name: /mot de passe oublié/i })).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderWithRouter(<ForgotPasswordPage />);

      expect(screen.getByText(/récupérez l'accès à votre compte/i)).toBeInTheDocument();
    });

    it('should render forgot password form', () => {
      renderWithRouter(<ForgotPasswordPage />);

      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pseudo/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /réinitialiser le mot de passe/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderWithRouter(<ForgotPasswordPage />);

      expect(screen.getByText(/vous vous souvenez de votre mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /se connecter/i })).toHaveAttribute('href', '/login');
    });

    it('should render skip link for accessibility', () => {
      renderWithRouter(<ForgotPasswordPage />);

      const skipLink = screen.getByText(/aller au contenu principal/i);
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content landmark', () => {
      renderWithRouter(<ForgotPasswordPage />);

      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });

    it('should render information about temporary password', () => {
      renderWithRouter(<ForgotPasswordPage />);

      expect(screen.getByText(/un nouveau mot de passe temporaire sera envoyé/i)).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should show error when email is empty', async () => {
      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/pseudo/i), 'TestUser');
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
    });

    it('should show error when email is invalid', async () => {
      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'invalid-email');
      await userEvent.type(screen.getByLabelText(/pseudo/i), 'TestUser');
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      expect(screen.getByText(/l'email n'est pas valide/i)).toBeInTheDocument();
    });

    it('should show error when pseudo is empty', async () => {
      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      expect(screen.getByText(/le pseudo est requis/i)).toBeInTheDocument();
    });

    it('should show error when pseudo is too short', async () => {
      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/pseudo/i), 'ab');
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      expect(screen.getByText(/le pseudo doit contenir au moins 3 caractères/i)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    const validFormData = {
      email: 'test@example.com',
      pseudo: 'TestUser',
    };

    it('should call forgotPassword service on valid submission', async () => {
      mockForgotPassword.mockResolvedValueOnce({ message: 'Email sent' });

      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith(validFormData);
      });
    });

    it('should show success message after successful submission', async () => {
      mockForgotPassword.mockResolvedValueOnce({ message: 'Email sent' });

      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/un nouveau mot de passe a été envoyé/i)).toBeInTheDocument();
      });
    });

    it('should show link to login page after success', async () => {
      mockForgotPassword.mockResolvedValueOnce({ message: 'Email sent' });

      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /retour à la connexion/i })).toHaveAttribute('href', '/login');
      });
    });

    it('should hide form after successful submission', async () => {
      mockForgotPassword.mockResolvedValueOnce({ message: 'Email sent' });

      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /réinitialiser le mot de passe/i })).not.toBeInTheDocument();
      });
    });

    it('should show error message when API returns error', async () => {
      mockForgotPassword.mockRejectedValueOnce({
        message: 'Aucun compte ne correspond aux informations fournies.',
        status: 404,
      });

      renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/aucun compte ne correspond/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations on initial render', async () => {
      const { container } = renderWithRouter(<ForgotPasswordPage />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations after successful submission', async () => {
      mockForgotPassword.mockResolvedValueOnce({ message: 'Email sent' });

      const { container } = renderWithRouter(<ForgotPasswordPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/pseudo/i), 'TestUser');
      await userEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/un nouveau mot de passe a été envoyé/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
