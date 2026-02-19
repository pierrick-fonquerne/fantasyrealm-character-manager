import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from './Header';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let mockAuthState = {
  isAuthenticated: false,
  user: null as { id: number; email: string; pseudo: string; role: string } | null,
  logout: mockLogout,
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Header />
    </MemoryRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
    };
  });

  describe('common elements', () => {
    it('renders the logo with correct alt text', () => {
      renderWithRouter();
      expect(screen.getByAltText('FantasyRealm')).toBeInTheDocument();
    });

    it('renders navigation links on desktop', () => {
      renderWithRouter();
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Galerie')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('renders burger menu button for mobile', () => {
      renderWithRouter();
      const burgerButton = screen.getByLabelText('Ouvrir le menu');
      expect(burgerButton).toBeInTheDocument();
    });

    it('toggles mobile menu when burger button is clicked', () => {
      renderWithRouter();
      const burgerButton = screen.getByLabelText('Ouvrir le menu');

      fireEvent.click(burgerButton);

      expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();
    });

    it('has correct href for logo', () => {
      renderWithRouter();
      const logo = screen.getByAltText('FantasyRealm').closest('a');
      expect(logo).toHaveAttribute('href', '/');
    });

    it('has correct hrefs for navigation links', () => {
      renderWithRouter();
      const accueilLinks = screen.getAllByText('Accueil');
      const galerieLinks = screen.getAllByText('Galerie');
      const contactLinks = screen.getAllByText('Contact');

      expect(accueilLinks[0]).toHaveAttribute('href', '/');
      expect(galerieLinks[0]).toHaveAttribute('href', '/galerie');
      expect(contactLinks[0]).toHaveAttribute('href', '/contact');
    });

    it('closes mobile menu when a link is clicked', () => {
      renderWithRouter();
      const burgerButton = screen.getByLabelText('Ouvrir le menu');

      fireEvent.click(burgerButton);
      expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();

      const mobileLinks = screen.getAllByText('Accueil');
      const mobileLink = mobileLinks[mobileLinks.length - 1];
      fireEvent.click(mobileLink);

      expect(screen.getByLabelText('Ouvrir le menu')).toBeInTheDocument();
    });
  });

  describe('unauthenticated state', () => {
    beforeEach(() => {
      mockAuthState = {
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      };
    });

    it('renders login and register buttons when not authenticated', () => {
      renderWithRouter();
      const loginButtons = screen.getAllByText('Connexion');
      const registerButtons = screen.getAllByText('Inscription');

      expect(loginButtons.length).toBeGreaterThan(0);
      expect(registerButtons.length).toBeGreaterThan(0);
    });

    it('does not render logout button when not authenticated', () => {
      renderWithRouter();
      expect(screen.queryByText('Déconnexion')).not.toBeInTheDocument();
    });

    it('does not render user avatar when not authenticated', () => {
      renderWithRouter();
      expect(screen.queryByLabelText('Menu utilisateur')).not.toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    beforeEach(() => {
      mockAuthState = {
        isAuthenticated: true,
        user: {
          id: 1,
          email: 'test@example.com',
          pseudo: 'TestUser',
          role: 'User',
        },
        logout: mockLogout,
      };
    });

    it('renders user avatar with initial when authenticated', () => {
      renderWithRouter();
      const avatarButton = screen.getByLabelText('Menu utilisateur');
      expect(avatarButton).toBeInTheDocument();
      expect(avatarButton).toHaveTextContent('T');
    });

    it('does not render login/register buttons when authenticated', () => {
      renderWithRouter();
      expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
      expect(screen.queryByText('Inscription')).not.toBeInTheDocument();
    });

    it('opens dropdown menu when avatar is clicked', () => {
      renderWithRouter();
      const avatarButton = screen.getByLabelText('Menu utilisateur');

      fireEvent.click(avatarButton);

      expect(screen.getByText('Mon profil')).toBeInTheDocument();
      expect(screen.getByText('Paramètres')).toBeInTheDocument();
      expect(screen.getByText('Déconnexion')).toBeInTheDocument();
    });

    it('displays user pseudo and email in dropdown', () => {
      renderWithRouter();
      const avatarButton = screen.getByLabelText('Menu utilisateur');

      fireEvent.click(avatarButton);

      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('calls logout and navigates to home when logout is clicked in dropdown', () => {
      renderWithRouter();
      const avatarButton = screen.getByLabelText('Menu utilisateur');
      fireEvent.click(avatarButton);

      const logoutButton = screen.getByText('Déconnexion');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('shows user info in mobile menu when authenticated', () => {
      renderWithRouter();
      const burgerButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(burgerButton);

      const pseudoElements = screen.getAllByText('TestUser');
      const emailElements = screen.getAllByText('test@example.com');

      expect(pseudoElements.length).toBeGreaterThan(0);
      expect(emailElements.length).toBeGreaterThan(0);
    });

    it('calls logout when clicking logout in mobile menu', () => {
      renderWithRouter();
      const burgerButton = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(burgerButton);

      const logoutButtons = screen.getAllByText('Déconnexion');
      const mobileLogoutButton = logoutButtons[logoutButtons.length - 1];
      fireEvent.click(mobileLogoutButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
