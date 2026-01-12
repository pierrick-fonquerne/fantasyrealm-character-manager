import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import RegisterPage from './RegisterPage';
import { authService } from '../services/authService';

expect.extend(toHaveNoViolations);

vi.mock('../services/authService', () => ({
  authService: {
    register: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
}));

const mockRegister = vi.mocked(authService.register);

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByRole('heading', { name: /créer un compte/i })).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByText(/rejoignez la communauté fantasyrealm/i)).toBeInTheDocument();
    });

    it('should render registration form', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByText(/déjà un compte/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /se connecter/i })).toHaveAttribute('href', '/login');
    });

    it('should render skip link for accessibility', () => {
      renderWithRouter(<RegisterPage />);

      const skipLink = screen.getByText(/aller au contenu principal/i);
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content landmark', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });
  });

  describe('success state', () => {
    const validFormData = {
      email: 'test@example.com',
      pseudo: 'TestUser',
      password: 'MySecure@Pass1',
      confirmPassword: 'MySecure@Pass1',
    };

    it('should display success message after successful registration', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: validFormData.email,
        pseudo: validFormData.pseudo,
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      renderWithRouter(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/inscription réussie/i)).toBeInTheDocument();
      });
    });

    it('should display welcome message in success state', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: validFormData.email,
        pseudo: validFormData.pseudo,
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      renderWithRouter(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/bienvenue dans fantasyrealm/i)).toBeInTheDocument();
      });
    });

    it('should display email confirmation notice in success state', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: validFormData.email,
        pseudo: validFormData.pseudo,
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      renderWithRouter(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/email de confirmation/i)).toBeInTheDocument();
      });
    });

    it('should display return to home link in success state', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: validFormData.email,
        pseudo: validFormData.pseudo,
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      renderWithRouter(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /retour à l'accueil/i })).toHaveAttribute('href', '/');
      });
    });

    it('should hide registration form in success state', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: validFormData.email,
        pseudo: validFormData.pseudo,
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      renderWithRouter(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/pseudo/i), validFormData.pseudo);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), validFormData.confirmPassword);
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /créer mon compte/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations on initial render', async () => {
      const { container } = renderWithRouter(<RegisterPage />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in success state', async () => {
      mockRegister.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        pseudo: 'TestUser',
        role: 'User',
        createdAt: new Date().toISOString(),
      });

      const { container } = renderWithRouter(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/pseudo/i), 'TestUser');
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), 'MySecure@Pass1');
      await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'MySecure@Pass1');
      await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

      await waitFor(() => {
        expect(screen.getByText(/inscription réussie/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
