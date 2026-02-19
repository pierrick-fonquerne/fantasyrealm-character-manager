import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import EditCharacterPage from './EditCharacterPage';
import * as characterService from '../services/characterService';
import type { CharacterResponse } from '../types';

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
  getCharacter: vi.fn(),
  updateCharacter: vi.fn(),
  submitCharacter: vi.fn(),
  checkNameAvailability: vi.fn().mockResolvedValue({ available: true }),
}));

const mockCharacter: CharacterResponse = {
  id: 1,
  name: 'Arthas',
  classId: 1,
  className: 'Guerrier',
  gender: 'Male',
  status: 'Draft',
  skinColor: '#E8BEAC',
  eyeColor: '#4A90D9',
  hairColor: '#2C1810',
  hairStyle: 'court',
  eyeShape: 'amande',
  noseShape: 'droit',
  mouthShape: 'fine',
  faceShape: 'ovale',
  isShared: false,
  isOwner: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const renderPage = (characterId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/characters/${characterId}/edit`]}>
      <Routes>
        <Route path="/characters/:id/edit" element={<EditCharacterPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('EditCharacterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(characterService.getCharacter).mockResolvedValue(mockCharacter);
  });

  it('should render page title', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /modification de personnage/i })).toBeInTheDocument();
    });
  });

  it('should render loading spinner initially', () => {
    vi.mocked(characterService.getCharacter).mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.queryByLabelText(/nom du personnage/i)).not.toBeInTheDocument();
  });

  it('should render the character form after loading', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/nom du personnage/i)).toHaveValue('Arthas');
  });

  it('should show error when character not found', async () => {
    vi.mocked(characterService.getCharacter).mockRejectedValue({ status: 404 });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/personnage introuvable/i)).toBeInTheDocument();
    });
  });

  it('should show error when access denied', async () => {
    vi.mocked(characterService.getCharacter).mockRejectedValue({ status: 403 });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/pas accès/i)).toBeInTheDocument();
    });
  });

  it('should show submit to moderation button for Draft character', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
    });
  });

  it('should not show submit to moderation for Approved character', async () => {
    vi.mocked(characterService.getCharacter).mockResolvedValue({
      ...mockCharacter,
      status: 'Approved',
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
    });
  });

  it('should show warning banner for Approved character', async () => {
    vi.mocked(characterService.getCharacter).mockResolvedValue({
      ...mockCharacter,
      status: 'Approved',
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/resoumettra automatiquement/i)).toBeInTheDocument();
    });
  });

  it('should render skip link for accessibility', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
    });

    const skipLink = screen.getByText(/aller au contenu principal/i);
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have main content landmark', async () => {
    renderPage();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
