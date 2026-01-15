import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginPage from './LoginPage';
import { authService } from '../services/authService';

expect.extend(toHaveNoViolations);

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockAuthLogin = vi.mocked(authService.login);

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/accédez à votre espace fantasyrealm/i)).toBeInTheDocument();
    });

    it('should render login form', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('should render registration link', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /créer un compte/i })).toHaveAttribute('href', '/register');
    });

    it('should render skip link for accessibility', () => {
      renderWithRouter(<LoginPage />);

      const skipLink = screen.getByText(/aller au contenu principal/i);
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content landmark', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });
  });

  describe('navigation', () => {
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

    it('should navigate to dashboard after successful login', async () => {
      mockAuthLogin.mockResolvedValueOnce(mockLoginResponse);

      renderWithRouter(<LoginPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not navigate when login fails', async () => {
      mockAuthLogin.mockRejectedValueOnce({
        message: 'Identifiants incorrects.',
        status: 401,
      });

      renderWithRouter(<LoginPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate when mustChangePassword is true', async () => {
      mockAuthLogin.mockResolvedValueOnce({
        ...mockLoginResponse,
        mustChangePassword: true,
      });

      renderWithRouter(<LoginPage />);

      await userEvent.type(screen.getByLabelText(/adresse email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/^mot de passe$/i), validFormData.password);
      await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText(/changement de mot de passe obligatoire/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations on initial render', async () => {
      const { container } = renderWithRouter(<LoginPage />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
