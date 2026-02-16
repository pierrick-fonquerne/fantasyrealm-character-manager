import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import CharacterDetailPage from './CharacterDetailPage';
import * as characterService from '../services/characterService';

expect.extend(toHaveNoViolations);

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, email: 'test@example.com', pseudo: 'TestUser', role: 'User' },
    token: 'fake-token',
    logout: vi.fn(),
  }),
}));

vi.mock('../services/characterService', () => ({
  getCharacterPublic: vi.fn(),
}));

const mockCharacter: characterService.CharacterResponse = {
  id: 1,
  name: 'Arthas',
  classId: 1,
  className: 'Guerrier',
  gender: 'Male',
  status: 'Approved',
  skinColor: '#E8BEAC',
  eyeColor: '#4A90D9',
  hairColor: '#2C1810',
  hairStyle: 'court',
  eyeShape: 'amande',
  noseShape: 'droit',
  mouthShape: 'fine',
  faceShape: 'ovale',
  isShared: true,
  isOwner: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const renderPage = (characterId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/characters/${characterId}`]}>
      <Routes>
        <Route path="/characters/:id" element={<CharacterDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('CharacterDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(characterService.getCharacterPublic).mockResolvedValue(mockCharacter);
  });

  it('should render loading spinner initially', () => {
    vi.mocked(characterService.getCharacterPublic).mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByRole('status', { name: /chargement/i })).toBeInTheDocument();
  });

  it('should render character name after loading', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Arthas' })).toBeInTheDocument();
    });
  });

  it('should render class and gender', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Guerrier').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('Masculin')).toBeInTheDocument();
  });

  it('should render status badge for Approved', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Approuvé')).toBeInTheDocument();
    });
  });

  it('should render character preview', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /aperçu du personnage arthas/i })).toBeInTheDocument();
    });
  });

  it('should render appearance section', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Apparence')).toBeInTheDocument();
    });
    expect(screen.getByRole('img', { name: /peau/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /cheveux/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /yeux/i })).toBeInTheDocument();
    expect(screen.getByText('Visage')).toBeInTheDocument();
    expect(screen.getByText('Ovale')).toBeInTheDocument();
    expect(screen.getByText('Court')).toBeInTheDocument();
  });

  it('should show shared indicator for owner with approved shared character', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Partagé')).toBeInTheDocument();
    });
  });

  it('should show private indicator for owner with approved non-shared character', async () => {
    vi.mocked(characterService.getCharacterPublic).mockResolvedValue({
      ...mockCharacter,
      isShared: false,
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Privé')).toBeInTheDocument();
    });
  });

  describe('owner actions', () => {
    it('should show edit button for owner', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/modifier arthas/i)).toBeInTheDocument();
      });
    });

    it('should show back to dashboard button for owner', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Retour au tableau de bord')).toBeInTheDocument();
      });
    });
  });

  describe('visitor view', () => {
    it('should not show edit button for non-owner', async () => {
      vi.mocked(characterService.getCharacterPublic).mockResolvedValue({
        ...mockCharacter,
        isOwner: false,
      });
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Arthas' })).toBeInTheDocument();
      });
      expect(screen.queryByLabelText(/modifier/i)).not.toBeInTheDocument();
    });

    it('should show back button for non-owner', async () => {
      vi.mocked(characterService.getCharacterPublic).mockResolvedValue({
        ...mockCharacter,
        isOwner: false,
      });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Retour')).toBeInTheDocument();
      });
    });

    it('should not show shared indicator for non-owner', async () => {
      vi.mocked(characterService.getCharacterPublic).mockResolvedValue({
        ...mockCharacter,
        isOwner: false,
      });
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Arthas' })).toBeInTheDocument();
      });
      expect(screen.queryByText('Partagé')).not.toBeInTheDocument();
      expect(screen.queryByText('Privé')).not.toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('should show error when character not found', async () => {
      vi.mocked(characterService.getCharacterPublic).mockRejectedValue({ status: 404 });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Personnage introuvable.')).toBeInTheDocument();
      });
    });

    it('should show generic error', async () => {
      vi.mocked(characterService.getCharacterPublic).mockRejectedValue({ status: 500 });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/erreur est survenue/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should render skip link', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Arthas' })).toBeInTheDocument();
      });

      const skipLink = screen.getByText(/aller au contenu principal/i);
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content landmark', () => {
      renderPage();
      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });

    it('should have no accessibility violations', async () => {
      const { container } = renderPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Arthas' })).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
