import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import ModerationPage from './ModerationPage';
import * as moderationService from '../services/moderationService';
import type { PendingCharacter, PagedResponse } from '../types';

expect.extend(toHaveNoViolations);

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, email: 'employee@example.com', pseudo: 'Moderator', role: 'Employee' },
    token: 'fake-employee-token',
    logout: vi.fn(),
  }),
}));

vi.mock('../services/moderationService', () => ({
  getPendingCharacters: vi.fn(),
  approveCharacter: vi.fn(),
  rejectCharacter: vi.fn(),
}));

const mockPendingCharacters = (): PendingCharacter[] => [
  {
    id: 1,
    name: 'Arthas',
    className: 'Guerrier',
    gender: 'Male',
    skinColor: '#E8BEAC',
    eyeColor: '#4A90D9',
    hairColor: '#2C1810',
    hairStyle: 'court',
    eyeShape: 'amande',
    noseShape: 'droit',
    mouthShape: 'fine',
    faceShape: 'ovale',
    ownerPseudo: 'TestUser',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    name: 'Jaina',
    className: 'Mage',
    gender: 'Female',
    skinColor: '#FFDFC4',
    eyeColor: '#2196F3',
    hairColor: '#DAA520',
    hairStyle: 'long',
    eyeShape: 'amande',
    noseShape: 'droit',
    mouthShape: 'charnue',
    faceShape: 'ovale',
    ownerPseudo: 'AnotherUser',
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const pagedResponse = (
  items: PendingCharacter[] = mockPendingCharacters(),
  totalCount?: number,
  totalPages?: number
): PagedResponse<PendingCharacter> => ({
  items,
  page: 1,
  pageSize: 12,
  totalCount: totalCount ?? items.length,
  totalPages: totalPages ?? 1,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/moderation']}>
      <Routes>
        <Route path="/moderation" element={<ModerationPage />} />
      </Routes>
    </MemoryRouter>
  );

const setupWithCharacters = async (data?: PagedResponse<PendingCharacter>) => {
  vi.mocked(moderationService.getPendingCharacters).mockResolvedValue(
    data ?? pagedResponse()
  );
  renderPage();
  await screen.findByText('Arthas');
};

describe('ModerationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading spinner initially', () => {
      vi.mocked(moderationService.getPendingCharacters).mockReturnValue(
        new Promise(() => {})
      );
      renderPage();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('with pending characters', () => {
    it('should display character names', async () => {
      await setupWithCharacters();

      expect(screen.getByText('Arthas')).toBeInTheDocument();
      expect(screen.getByText('Jaina')).toBeInTheDocument();
    });

    it('should display pending count in stats', async () => {
      await setupWithCharacters();

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('should render a semantic list', async () => {
      await setupWithCharacters();

      const list = screen.getByRole('list', { name: /personnages en attente/i });
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });
  });

  describe('empty state', () => {
    it('should show empty message when no pending characters', async () => {
      vi.mocked(moderationService.getPendingCharacters).mockResolvedValue(
        pagedResponse([], 0, 0)
      );
      renderPage();

      expect(
        await screen.findByText(/aucun personnage en attente de modération/i)
      ).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error when fetch fails', async () => {
      vi.mocked(moderationService.getPendingCharacters).mockRejectedValue(
        new Error('fail')
      );
      renderPage();

      expect(
        await screen.findByText(/impossible de charger/i)
      ).toBeInTheDocument();
    });

    it('should reload data when clicking retry', async () => {
      const user = userEvent.setup();
      vi.mocked(moderationService.getPendingCharacters)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(pagedResponse());

      renderPage();
      const retryButton = await screen.findByText(/réessayer/i);
      await user.click(retryButton);

      await waitFor(() => {
        expect(moderationService.getPendingCharacters).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('approve action', () => {
    it('should call approveCharacter and remove card', async () => {
      const user = userEvent.setup();
      vi.mocked(moderationService.approveCharacter).mockResolvedValue({
        id: 1, name: 'Arthas', classId: 1, className: 'Guerrier', gender: 'Male',
        status: 'Approved', skinColor: '', eyeColor: '', hairColor: '', hairStyle: '',
        eyeShape: '', noseShape: '', mouthShape: '', faceShape: '', isShared: false,
        isOwner: false, createdAt: '', updatedAt: '',
      });
      await setupWithCharacters();

      const approveButton = screen.getByRole('button', { name: /approuver arthas/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(moderationService.approveCharacter).toHaveBeenCalledWith(1, 'fake-employee-token');
      });

      await waitFor(() => {
        expect(screen.queryByText('Arthas')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Jaina')).toBeInTheDocument();
    });
  });

  describe('reject action', () => {
    it('should open reject modal when clicking reject', async () => {
      const user = userEvent.setup();
      await setupWithCharacters();

      const rejectButton = screen.getByRole('button', { name: /rejeter arthas/i });
      await user.click(rejectButton);

      expect(screen.getByText(/rejeter arthas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/motif du rejet/i)).toBeInTheDocument();
    });

    it('should show validation error when reason is too short', async () => {
      const user = userEvent.setup();
      await setupWithCharacters();

      await user.click(screen.getByRole('button', { name: /rejeter arthas/i }));
      const textarea = screen.getByLabelText(/motif du rejet/i);
      await user.type(textarea, 'Court');
      await user.click(screen.getByRole('button', { name: /confirmer le rejet/i }));

      expect(
        await screen.findByText(/au moins 10 caractères/i)
      ).toBeInTheDocument();
      expect(moderationService.rejectCharacter).not.toHaveBeenCalled();
    });

    it('should call rejectCharacter and remove card on valid submission', async () => {
      const user = userEvent.setup();
      vi.mocked(moderationService.rejectCharacter).mockResolvedValue({
        id: 1, name: 'Arthas', classId: 1, className: 'Guerrier', gender: 'Male',
        status: 'Rejected', skinColor: '', eyeColor: '', hairColor: '', hairStyle: '',
        eyeShape: '', noseShape: '', mouthShape: '', faceShape: '', isShared: false,
        isOwner: false, createdAt: '', updatedAt: '',
      });
      await setupWithCharacters();

      await user.click(screen.getByRole('button', { name: /rejeter arthas/i }));
      const textarea = screen.getByLabelText(/motif du rejet/i);
      await user.type(textarea, 'Contenu inapproprié pour le jeu');
      await user.click(screen.getByRole('button', { name: /confirmer le rejet/i }));

      await waitFor(() => {
        expect(moderationService.rejectCharacter).toHaveBeenCalledWith(
          1,
          'Contenu inapproprié pour le jeu',
          'fake-employee-token'
        );
      });

      await waitFor(() => {
        expect(screen.queryByText('Arthas')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Jaina')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('should show pagination when multiple pages', async () => {
      await setupWithCharacters(pagedResponse(mockPendingCharacters(), 24, 2));

      expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
    });

    it('should not show pagination for single page', async () => {
      await setupWithCharacters(pagedResponse(mockPendingCharacters(), 2, 1));

      expect(screen.queryByLabelText('Pagination')).not.toBeInTheDocument();
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      vi.mocked(moderationService.getPendingCharacters).mockResolvedValue(
        pagedResponse()
      );
      const { container } = renderPage();
      await screen.findByText('Arthas');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
