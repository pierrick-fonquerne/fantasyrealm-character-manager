import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardPage from './DashboardPage';

expect.extend(toHaveNoViolations);

const mockLogout = vi.fn();

let mockAuthState = {
  isAuthenticated: true,
  user: {
    id: 1,
    email: 'test@example.com',
    pseudo: 'TestUser',
    role: 'User',
  },
  logout: mockLogout,
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('authenticated user', () => {
    it('should render welcome message with user pseudo', () => {
      renderWithRouter();

      expect(screen.getByText(/bienvenue,/i)).toBeInTheDocument();
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderWithRouter();

      expect(screen.getByText(/votre espace personnel fantasyrealm/i)).toBeInTheDocument();
    });

    it('should render under construction message', () => {
      renderWithRouter();

      expect(screen.getByText(/cette section est en cours de construction/i)).toBeInTheDocument();
    });

    it('should render skip link for accessibility', () => {
      renderWithRouter();

      const skipLink = screen.getByText(/aller au contenu principal/i);
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content landmark', () => {
      renderWithRouter();

      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });

    it('should render header', () => {
      renderWithRouter();

      const logos = screen.getAllByText('FantasyRealm');
      expect(logos.length).toBeGreaterThan(0);
    });

    it('should render footer', () => {
      renderWithRouter();

      expect(screen.getByText(/pixelverse studios/i)).toBeInTheDocument();
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithRouter();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
