import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import CreateCharacterPage from './CreateCharacterPage';

expect.extend(toHaveNoViolations);

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, email: 'test@example.com', pseudo: 'TestUser', role: 'User' },
    token: 'fake-token',
    logout: vi.fn(),
  }),
}));

vi.mock('../services/referenceDataService', () => ({
  fetchCharacterClasses: vi.fn().mockResolvedValue([
    { id: 1, name: 'Guerrier', description: 'Un combattant robuste.', iconUrl: null },
  ]),
}));

vi.mock('../services/characterService', () => ({
  createCharacter: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
}));

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/characters/create']}>
      <CreateCharacterPage />
    </MemoryRouter>
  );
};

describe('CreateCharacterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /créer un personnage/i })).toBeInTheDocument();
  });

  it('should render the character form', () => {
    renderPage();

    expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
  });

  it('should render skip link for accessibility', () => {
    renderPage();

    const skipLink = screen.getByText(/aller au contenu principal/i);
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have main content landmark', () => {
    renderPage();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('should render header and footer', () => {
    renderPage();

    const logos = screen.getAllByText('FantasyRealm');
    expect(logos.length).toBeGreaterThan(0);
    expect(screen.getByText(/pixelverse studios/i)).toBeInTheDocument();
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderPage();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
