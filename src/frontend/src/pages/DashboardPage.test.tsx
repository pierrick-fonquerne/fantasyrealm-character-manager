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
  token: 'fake-token',
  logout: mockLogout,
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('../services/characterService', () => ({
  getMyCharacters: vi.fn().mockResolvedValue([]),
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
      token: 'fake-token',
      logout: mockLogout,
    };
  });

  describe('authenticated user', () => {
    it('should render welcome message with user pseudo', () => {
      renderWithRouter();

      expect(screen.getByText(/bienvenue,/i)).toBeInTheDocument();
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('should render create character button', () => {
      renderWithRouter();

      expect(screen.getByText(/créer un personnage/i)).toBeInTheDocument();
    });

    it('should render empty state when no characters', async () => {
      renderWithRouter();

      expect(await screen.findByText(/vous n'avez pas encore de personnage/i)).toBeInTheDocument();
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

  describe('with characters', () => {
    it('should render character list', async () => {
      const { getMyCharacters } = await import('../services/characterService');
      vi.mocked(getMyCharacters).mockResolvedValue([
        {
          id: 1,
          name: 'Arthas',
          className: 'Guerrier',
          status: 'Draft',
          gender: 'Male',
          isShared: false,
          skinColor: '#C19A6B',
          hairColor: '#4A3C31',
          eyeColor: '#4A3C31',
          faceShape: 'ovale',
          hairStyle: 'court',
          eyeShape: 'amande',
          noseShape: 'droit',
          mouthShape: 'moyenne',
        },
        {
          id: 2,
          name: 'Jaina',
          className: 'Mage',
          status: 'Approved',
          gender: 'Female',
          isShared: true,
          skinColor: '#FFDFC4',
          hairColor: '#DAA520',
          eyeColor: '#2196F3',
          faceShape: 'ovale',
          hairStyle: 'long',
          eyeShape: 'amande',
          noseShape: 'droit',
          mouthShape: 'charnue',
        },
      ]);

      renderWithRouter();

      expect(await screen.findByText('Arthas')).toBeInTheDocument();
      expect(screen.getByText('Jaina')).toBeInTheDocument();
      expect(screen.getByText('Brouillon')).toBeInTheDocument();
      expect(screen.getByText('Approuvé')).toBeInTheDocument();
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
