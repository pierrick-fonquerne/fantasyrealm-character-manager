import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import ModerationPage from './ModerationPage';
import * as moderationService from '../services/moderationService';
import type { PendingCharacter, PendingComment, UserManagement, PagedResponse } from '../types';

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
  getPendingComments: vi.fn(),
  approveComment: vi.fn(),
  rejectComment: vi.fn(),
  getUsers: vi.fn(),
  getUsersCount: vi.fn(),
  suspendUser: vi.fn(),
  reactivateUser: vi.fn(),
  deleteUser: vi.fn(),
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

const emptyResponse = <T,>(): PagedResponse<T> => ({
  items: [],
  page: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
});

describe('ModerationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(moderationService.getPendingComments).mockResolvedValue(emptyResponse());
    vi.mocked(moderationService.getUsers).mockResolvedValue(emptyResponse());
    vi.mocked(moderationService.getUsersCount).mockResolvedValue(0);
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

      const statsLabel = screen.getByText('Personnages en attente');
      const statsBlock = statsLabel.closest('div')!;
      expect(within(statsBlock).getByText('2')).toBeInTheDocument();
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

  describe('tabs', () => {
    it('should display three tabs with correct labels', async () => {
      await setupWithCharacters();

      expect(screen.getByRole('tab', { name: /personnages/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /commentaires/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /utilisateurs/i })).toBeInTheDocument();
    });

    it('should show characters tab as active by default', async () => {
      await setupWithCharacters();

      expect(screen.getByRole('tab', { name: /personnages/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /commentaires/i })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tab', { name: /utilisateurs/i })).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('comments tab', () => {
    const mockPendingComments = (): PendingComment[] => [
      {
        id: 10,
        rating: 4,
        text: 'Un personnage vraiment bien réalisé !',
        commentedAt: new Date(Date.now() - 86400000).toISOString(),
        characterId: 1,
        characterName: 'Gandalf',
        authorId: 5,
        authorPseudo: 'Frodon',
      },
      {
        id: 11,
        rating: 2,
        text: 'Bof, pas terrible comme personnage.',
        commentedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        characterId: 2,
        characterName: 'Legolas',
        authorId: 6,
        authorPseudo: 'Sam',
      },
    ];

    const commentPagedResponse = (
      items: PendingComment[] = mockPendingComments(),
      totalCount?: number,
      totalPages?: number
    ): PagedResponse<PendingComment> => ({
      items,
      page: 1,
      pageSize: 12,
      totalCount: totalCount ?? items.length,
      totalPages: totalPages ?? 1,
    });

    const switchToCommentsTab = async () => {
      const user = userEvent.setup();
      const commentsTab = screen.getByRole('tab', { name: /commentaires/i });
      await user.click(commentsTab);
    };

    const setupWithComments = async (data?: PagedResponse<PendingComment>) => {
      vi.mocked(moderationService.getPendingCharacters).mockResolvedValue(
        pagedResponse([], 0, 0)
      );
      vi.mocked(moderationService.getPendingComments).mockResolvedValue(
        data ?? commentPagedResponse()
      );
      renderPage();
      await waitFor(() => {
        expect(moderationService.getPendingComments).toHaveBeenCalled();
      });
      await switchToCommentsTab();
    };

    it('should display pending comments after switching tab', async () => {
      await setupWithComments();

      expect(screen.getByText('Frodon')).toBeInTheDocument();
      expect(screen.getByText('Sam')).toBeInTheDocument();
      expect(screen.getByText(/gandalf/i)).toBeInTheDocument();
      expect(screen.getByText(/legolas/i)).toBeInTheDocument();
    });

    it('should display comment count in stats', async () => {
      await setupWithComments();

      const statsLabel = screen.getByText('Commentaires en attente');
      const statsBlock = statsLabel.closest('div')!;
      expect(within(statsBlock).getByText('2')).toBeInTheDocument();
    });

    it('should show empty message when no pending comments', async () => {
      await setupWithComments(commentPagedResponse([], 0, 0));

      expect(
        screen.getByText(/aucun commentaire en attente de modération/i)
      ).toBeInTheDocument();
    });

    it('should call approveComment and remove card', async () => {
      vi.mocked(moderationService.approveComment).mockResolvedValue({
        id: 10, rating: 4, text: 'Un personnage vraiment bien réalisé !',
        status: 'Approved', commentedAt: '', characterId: 1, authorId: 5, authorPseudo: 'Frodon',
      });
      await setupWithComments();

      const user = userEvent.setup();
      const approveButton = screen.getByRole('button', { name: /approuver l'avis de frodon/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(moderationService.approveComment).toHaveBeenCalledWith(10, 'fake-employee-token');
      });

      await waitFor(() => {
        expect(screen.queryByText('Frodon')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Sam')).toBeInTheDocument();
    });

    it('should open reject modal and call rejectComment', async () => {
      vi.mocked(moderationService.rejectComment).mockResolvedValue({
        id: 10, rating: 4, text: 'Un personnage vraiment bien réalisé !',
        status: 'Rejected', commentedAt: '', characterId: 1, authorId: 5, authorPseudo: 'Frodon',
        rejectionReason: 'Langage inapproprié dans le commentaire',
      });
      await setupWithComments();

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /rejeter l'avis de frodon/i }));

      expect(screen.getByText(/rejeter l'avis de frodon/i)).toBeInTheDocument();

      const textarea = screen.getByLabelText(/motif du rejet/i);
      await user.type(textarea, 'Langage inapproprié dans le commentaire');
      await user.click(screen.getByRole('button', { name: /confirmer le rejet/i }));

      await waitFor(() => {
        expect(moderationService.rejectComment).toHaveBeenCalledWith(
          10,
          'Langage inapproprié dans le commentaire',
          'fake-employee-token'
        );
      });

      await waitFor(() => {
        expect(screen.queryByText('Frodon')).not.toBeInTheDocument();
      });
    });

    it('should show error when comment fetch fails', async () => {
      vi.mocked(moderationService.getPendingCharacters).mockResolvedValue(
        pagedResponse([], 0, 0)
      );
      vi.mocked(moderationService.getPendingComments).mockRejectedValue(
        new Error('fail')
      );
      renderPage();
      await switchToCommentsTab();

      expect(
        await screen.findByText(/impossible de charger les commentaires/i)
      ).toBeInTheDocument();
    });

    it('should render a semantic list of comments', async () => {
      await setupWithComments();

      const list = screen.getByRole('list', { name: /commentaires en attente/i });
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });
  });

  describe('users tab', () => {
    const mockUsers = (): UserManagement[] => [
      {
        id: 10,
        pseudo: 'Frodon',
        email: 'frodon@example.com',
        isSuspended: false,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        characterCount: 3,
      },
      {
        id: 11,
        pseudo: 'Sauron',
        email: 'sauron@example.com',
        isSuspended: true,
        createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
        characterCount: 1,
      },
    ];

    const userPagedResponse = (
      items: UserManagement[] = mockUsers(),
      totalCount?: number,
      totalPages?: number
    ): PagedResponse<UserManagement> => ({
      items,
      page: 1,
      pageSize: 12,
      totalCount: totalCount ?? items.length,
      totalPages: totalPages ?? 1,
    });

    const switchToUsersTab = async () => {
      const user = userEvent.setup();
      const usersTab = screen.getByRole('tab', { name: /utilisateurs/i });
      await user.click(usersTab);
    };

    const setupWithUsers = async (data?: PagedResponse<UserManagement>) => {
      vi.mocked(moderationService.getPendingCharacters).mockResolvedValue(
        pagedResponse([], 0, 0)
      );
      vi.mocked(moderationService.getUsers).mockResolvedValue(
        data ?? userPagedResponse()
      );
      vi.mocked(moderationService.getUsersCount).mockResolvedValue(2);
      renderPage();
      await waitFor(() => {
        expect(moderationService.getUsers).toHaveBeenCalled();
      });
      await switchToUsersTab();
    };

    it('should display users after switching tab', async () => {
      await setupWithUsers();

      expect(screen.getByText('Frodon')).toBeInTheDocument();
      expect(screen.getByText('Sauron')).toBeInTheDocument();
      expect(screen.getByText('frodon@example.com')).toBeInTheDocument();
      expect(screen.getByText('sauron@example.com')).toBeInTheDocument();
    });

    it('should display user count in stats', async () => {
      await setupWithUsers();

      const allUtilisateurs = screen.getAllByText('Utilisateurs');
      const statsLabel = allUtilisateurs.find(
        (el) => el.tagName === 'P' && el.classList.contains('text-sm')
      )!;
      const statsBlock = statsLabel.closest('div')!;
      expect(within(statsBlock).getByText('2')).toBeInTheDocument();
    });

    it('should display active and suspended badges', async () => {
      await setupWithUsers();

      expect(screen.getByText('Actif')).toBeInTheDocument();
      expect(screen.getByText('Suspendu')).toBeInTheDocument();
    });

    it('should show suspend button for active users', async () => {
      await setupWithUsers();

      expect(screen.getByRole('button', { name: /suspendre le compte de frodon/i })).toBeInTheDocument();
    });

    it('should show reactivate button for suspended users', async () => {
      await setupWithUsers();

      expect(screen.getByRole('button', { name: /réactiver le compte de sauron/i })).toBeInTheDocument();
    });

    it('should open suspend modal and call suspendUser', async () => {
      const updatedUser: UserManagement = {
        id: 10, pseudo: 'Frodon', email: 'frodon@example.com',
        isSuspended: true, createdAt: new Date().toISOString(), characterCount: 3,
      };
      vi.mocked(moderationService.suspendUser).mockResolvedValue(updatedUser);
      await setupWithUsers();

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /suspendre le compte de frodon/i }));

      expect(screen.getByText(/suspendre frodon/i)).toBeInTheDocument();

      const textarea = screen.getByLabelText(/motif de la suspension/i);
      await user.type(textarea, 'Comportement inapproprié envers les joueurs');
      await user.click(screen.getByRole('button', { name: /confirmer la suspension/i }));

      await waitFor(() => {
        expect(moderationService.suspendUser).toHaveBeenCalledWith(
          10,
          'Comportement inapproprié envers les joueurs',
          'fake-employee-token'
        );
      });
    });

    it('should call reactivateUser on click', async () => {
      const updatedUser: UserManagement = {
        id: 11, pseudo: 'Sauron', email: 'sauron@example.com',
        isSuspended: false, createdAt: new Date().toISOString(), characterCount: 1,
      };
      vi.mocked(moderationService.reactivateUser).mockResolvedValue(updatedUser);
      await setupWithUsers();

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /réactiver le compte de sauron/i }));

      await waitFor(() => {
        expect(moderationService.reactivateUser).toHaveBeenCalledWith(11, 'fake-employee-token');
      });
    });

    it('should open delete modal and call deleteUser', async () => {
      vi.mocked(moderationService.deleteUser).mockResolvedValue();
      await setupWithUsers();

      const user = userEvent.setup();
      const deleteButtons = screen.getAllByRole('button', { name: /supprimer le compte de/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/supprimer frodon/i)).toBeInTheDocument();
      expect(screen.getByText(/irréversible/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /supprimer définitivement/i }));

      await waitFor(() => {
        expect(moderationService.deleteUser).toHaveBeenCalledWith(10, 'fake-employee-token');
      });
    });

    it('should show empty message when no users match search', async () => {
      await setupWithUsers(userPagedResponse([], 0, 0));

      expect(
        screen.getByText(/aucun utilisateur/i)
      ).toBeInTheDocument();
    });

    it('should render a semantic list of users', async () => {
      await setupWithUsers();

      const list = screen.getByRole('list', { name: /liste des utilisateurs/i });
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });

    it('should have search input and filter select', async () => {
      await setupWithUsers();

      expect(screen.getByLabelText(/rechercher un utilisateur/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filtrer par statut/i)).toBeInTheDocument();
    });
  });
});
