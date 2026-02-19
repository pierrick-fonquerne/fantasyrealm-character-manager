import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardPage from './DashboardPage';
import type { CharacterSummary } from '../types';

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
  deleteCharacter: vi.fn().mockResolvedValue(undefined),
  duplicateCharacter: vi.fn().mockResolvedValue({}),
  toggleShareCharacter: vi.fn().mockResolvedValue({ isShared: false }),
  checkNameAvailability: vi.fn().mockResolvedValue({ available: true }),
}));

const mockCharacters = (): CharacterSummary[] => [
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
];

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );
};

const setupWithCharacters = async () => {
  const { getMyCharacters } = await import('../services/characterService');
  vi.mocked(getMyCharacters).mockResolvedValue(mockCharacters());
  renderWithRouter();
  await screen.findByText('Arthas');
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
      await setupWithCharacters();

      expect(screen.getByText('Arthas')).toBeInTheDocument();
      expect(screen.getByText('Jaina')).toBeInTheDocument();
      expect(screen.getByText('Brouillon')).toBeInTheDocument();
      expect(screen.getByText('Approuvé')).toBeInTheDocument();
    });
  });

  describe('statistics', () => {
    it('should display correct counts', async () => {
      await setupWithCharacters();

      const stats = screen.getByLabelText('Statistiques');
      expect(stats).toHaveTextContent('2');
      expect(stats).toHaveTextContent('1');
      expect(stats).toHaveTextContent('0');
    });
  });

  describe('delete action', () => {
    it('should open delete modal when clicking delete button', async () => {
      await setupWithCharacters();

      fireEvent.click(screen.getByRole('button', { name: /supprimer jaina/i }));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/voulez-vous vraiment supprimer/i)).toBeInTheDocument();
      expect(within(dialog).getByText('Jaina')).toBeInTheDocument();
    });

    it('should delete character and remove from list on confirm', async () => {
      const { deleteCharacter } = await import('../services/characterService');
      await setupWithCharacters();

      fireEvent.click(screen.getByRole('button', { name: /supprimer jaina/i }));

      const dialog = screen.getByRole('dialog');
      fireEvent.click(
        Array.from(dialog.querySelectorAll('button')).find(
          (btn) => btn.textContent === 'Supprimer'
        )!
      );

      await waitFor(() => {
        expect(deleteCharacter).toHaveBeenCalledWith(2, 'fake-token');
      });

      await waitFor(() => {
        expect(screen.queryByText('Jaina')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Arthas')).toBeInTheDocument();
    });

    it('should show error when delete fails', async () => {
      const { deleteCharacter } = await import('../services/characterService');
      vi.mocked(deleteCharacter).mockRejectedValueOnce(new Error('fail'));
      await setupWithCharacters();

      fireEvent.click(screen.getByRole('button', { name: /supprimer jaina/i }));
      const dialog = screen.getByRole('dialog');
      fireEvent.click(
        Array.from(dialog.querySelectorAll('button')).find(
          (btn) => btn.textContent === 'Supprimer'
        )!
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Impossible de supprimer le personnage.');
      });
    });
  });

  describe('share toggle action', () => {
    it('should toggle share status on click', async () => {
      const { toggleShareCharacter } = await import('../services/characterService');
      vi.mocked(toggleShareCharacter).mockResolvedValueOnce({
        id: 2,
        name: 'Jaina',
        classId: 2,
        className: 'Mage',
        status: 'Approved',
        gender: 'Female',
        isShared: false,
        isOwner: true,
        skinColor: '#FFDFC4',
        hairColor: '#DAA520',
        eyeColor: '#2196F3',
        faceShape: 'ovale',
        hairStyle: 'long',
        eyeShape: 'amande',
        noseShape: 'droit',
        mouthShape: 'charnue',
        createdAt: '',
        updatedAt: '',
      });
      await setupWithCharacters();

      expect(screen.getByText('Partagé')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /rendre jaina privé/i }));

      await waitFor(() => {
        expect(toggleShareCharacter).toHaveBeenCalledWith(2, 'fake-token');
      });

      await waitFor(() => {
        expect(screen.getByText('Privé')).toBeInTheDocument();
      });
    });

    it('should show error when toggle fails', async () => {
      const { toggleShareCharacter } = await import('../services/characterService');
      vi.mocked(toggleShareCharacter).mockRejectedValueOnce(new Error('fail'));
      await setupWithCharacters();

      fireEvent.click(screen.getByRole('button', { name: /rendre jaina privé/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Impossible de modifier le partage.');
      });
    });
  });

  describe('duplicate action', () => {
    it('should open duplicate modal when clicking duplicate button', async () => {
      await setupWithCharacters();

      fireEvent.click(screen.getByRole('button', { name: /dupliquer jaina/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/nom du nouveau personnage/i)).toBeInTheDocument();
    });

    it('should call duplicateCharacter and refresh list on confirm', async () => {
      const user = userEvent.setup();
      const { duplicateCharacter, getMyCharacters } = await import('../services/characterService');
      vi.mocked(duplicateCharacter).mockResolvedValueOnce({
        id: 3,
        name: 'Jaina (copie)',
        classId: 2,
        className: 'Mage',
        status: 'Draft',
        gender: 'Female',
        isShared: false,
        isOwner: true,
        skinColor: '#FFDFC4',
        hairColor: '#DAA520',
        eyeColor: '#2196F3',
        faceShape: 'ovale',
        hairStyle: 'long',
        eyeShape: 'amande',
        noseShape: 'droit',
        mouthShape: 'charnue',
        createdAt: '',
        updatedAt: '',
      });
      await setupWithCharacters();

      fireEvent.click(screen.getByRole('button', { name: /dupliquer jaina/i }));

      await waitFor(() => {
        expect(screen.getByText('Ce nom est disponible')).toBeInTheDocument();
      }, { timeout: 3000 });

      await user.click(screen.getByRole('button', { name: /^dupliquer$/i }));

      await waitFor(() => {
        expect(duplicateCharacter).toHaveBeenCalledWith(2, 'Jaina (copie)', 'fake-token');
      });

      await waitFor(() => {
        expect(vi.mocked(getMyCharacters).mock.calls.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should show error when duplicate fails', async () => {
      const user = userEvent.setup();
      const { duplicateCharacter } = await import('../services/characterService');
      vi.mocked(duplicateCharacter).mockRejectedValueOnce(new Error('fail'));
      await setupWithCharacters();

      fireEvent.click(screen.getByRole('button', { name: /dupliquer jaina/i }));

      await waitFor(() => {
        expect(screen.getByText('Ce nom est disponible')).toBeInTheDocument();
      }, { timeout: 3000 });

      await user.click(screen.getByRole('button', { name: /^dupliquer$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Impossible de dupliquer le personnage.');
      });
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
