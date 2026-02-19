import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CharacterDetailPage from './CharacterDetailPage';
import * as characterService from '../services/characterService';
import * as commentService from '../services/commentService';
import type { CharacterResponse, CommentResponse } from '../types';

interface MockAuth {
  isAuthenticated: boolean;
  user: { id: number; email: string; pseudo: string; role: string } | null;
  token: string | null;
  logout: ReturnType<typeof vi.fn>;
}

const mockAuthOwner: MockAuth = {
  isAuthenticated: true,
  user: { id: 10, email: 'owner@example.com', pseudo: 'Owner', role: 'User' },
  token: 'fake-token',
  logout: vi.fn(),
};

const mockAuthReviewer: MockAuth = {
  isAuthenticated: true,
  user: { id: 20, email: 'reviewer@example.com', pseudo: 'Reviewer', role: 'User' },
  token: 'fake-token',
  logout: vi.fn(),
};

const mockAuthAnonymous: MockAuth = {
  isAuthenticated: false,
  user: null,
  token: null,
  logout: vi.fn(),
};

let mockAuth: MockAuth = mockAuthReviewer;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../services/characterService', () => ({
  getCharacterPublic: vi.fn(),
}));

vi.mock('../services/commentService', () => ({
  getCharacterComments: vi.fn(),
  getMyComment: vi.fn(),
  createComment: vi.fn(),
  deleteComment: vi.fn(),
}));

const approvedCharacter: CharacterResponse = {
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
  isOwner: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockComments: CommentResponse[] = [
  {
    id: 1,
    rating: 5,
    text: 'Excellent personnage, très bien fait !',
    status: 'Approved',
    commentedAt: '2025-06-01T10:00:00Z',
    characterId: 1,
    authorId: 30,
    authorPseudo: 'Gandalf',
  },
  {
    id: 2,
    rating: 3,
    text: 'Personnage correct mais peut mieux faire.',
    status: 'Approved',
    commentedAt: '2025-06-02T14:00:00Z',
    characterId: 1,
    authorId: 40,
    authorPseudo: 'Legolas',
  },
];

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/characters/1']}>
      <Routes>
        <Route path="/characters/:id" element={<CharacterDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('CommentSection integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = mockAuthReviewer;
    vi.mocked(characterService.getCharacterPublic).mockResolvedValue(approvedCharacter);
    vi.mocked(commentService.getCharacterComments).mockResolvedValue(mockComments);
    vi.mocked(commentService.getMyComment).mockResolvedValue(null);
  });

  it('should render the comments section with comments', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /^avis$/i })).toBeInTheDocument();
      expect(screen.getByText('Gandalf')).toBeInTheDocument();
      expect(screen.getByText('Legolas')).toBeInTheDocument();
    });
  });

  it('should display average rating', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/4\.0/)).toBeInTheDocument();
      expect(screen.getByText(/2 avis/)).toBeInTheDocument();
    });
  });

  it('should show comment form for authenticated non-owner', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Donner votre avis')).toBeInTheDocument();
    });
  });

  it('should show login link when not authenticated', async () => {
    mockAuth = mockAuthAnonymous;
    vi.mocked(characterService.getCharacterPublic).mockResolvedValue(approvedCharacter);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/connectez-vous/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/se connecter/i)).toHaveAttribute('href', '/login');
  });

  it('should show owner message when user is the character owner', async () => {
    mockAuth = mockAuthOwner;
    vi.mocked(characterService.getCharacterPublic).mockResolvedValue({
      ...approvedCharacter,
      isOwner: true,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/ne pouvez pas commenter votre propre personnage/i)).toBeInTheDocument();
    });
  });

  it('should show already commented message when user has commented', async () => {
    const commentsWithReviewer: CommentResponse[] = [
      ...mockComments,
      {
        id: 3,
        rating: 4,
        text: 'Mon avis déjà donné sur ce personnage.',
        status: 'Approved',
        commentedAt: '2025-06-03T10:00:00Z',
        characterId: 1,
        authorId: 20,
        authorPseudo: 'Reviewer',
      },
    ];
    vi.mocked(commentService.getCharacterComments).mockResolvedValue(commentsWithReviewer);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/déjà donné votre avis/i)).toBeInTheDocument();
    });
  });

  it('should submit a comment successfully', async () => {
    vi.mocked(commentService.getCharacterComments).mockResolvedValue([]);
    vi.mocked(commentService.createComment).mockResolvedValue({
      id: 10,
      rating: 4,
      text: 'Super personnage bien réalisé !',
      status: 'Pending',
      commentedAt: '2025-06-10T10:00:00Z',
      characterId: 1,
      authorId: 20,
      authorPseudo: 'Reviewer',
    });

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Donner votre avis')).toBeInTheDocument();
    });

    const stars = screen.getAllByRole('radio');
    await user.click(stars[3]);

    const textarea = screen.getByPlaceholderText(/partagez votre avis/i);
    await user.type(textarea, 'Super personnage bien réalisé !');

    await user.click(screen.getByText('Envoyer mon avis'));

    await waitFor(() => {
      expect(commentService.createComment).toHaveBeenCalledWith(
        1,
        { rating: 4, text: 'Super personnage bien réalisé !' },
        'fake-token'
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/merci pour votre avis/i)).toBeInTheDocument();
      expect(screen.getByText(/après validation/i)).toBeInTheDocument();
    });
  });

  it('should show validation error when text is too short', async () => {
    vi.mocked(commentService.getCharacterComments).mockResolvedValue([]);
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Donner votre avis')).toBeInTheDocument();
    });

    const stars = screen.getAllByRole('radio');
    await user.click(stars[2]);

    const textarea = screen.getByPlaceholderText(/partagez votre avis/i);
    await user.type(textarea, 'Court');

    await user.click(screen.getByText('Envoyer mon avis'));

    await waitFor(() => {
      expect(screen.getByText(/au moins 10 caractères/i)).toBeInTheDocument();
    });
    expect(commentService.createComment).not.toHaveBeenCalled();
  });

  it('should show validation error when no rating selected', async () => {
    vi.mocked(commentService.getCharacterComments).mockResolvedValue([]);
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Donner votre avis')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/partagez votre avis/i);
    await user.type(textarea, 'Un commentaire suffisamment long pour le test.');

    await user.click(screen.getByText('Envoyer mon avis'));

    await waitFor(() => {
      expect(screen.getByText(/sélectionner une note/i)).toBeInTheDocument();
    });
    expect(commentService.createComment).not.toHaveBeenCalled();
  });

  it('should allow author to delete their own comment', async () => {
    const commentsWithAuthor: CommentResponse[] = [
      {
        id: 5,
        rating: 4,
        text: 'Mon avis que je veux supprimer bientôt.',
        status: 'Approved',
        commentedAt: '2025-06-05T10:00:00Z',
        characterId: 1,
        authorId: 20,
        authorPseudo: 'Reviewer',
      },
    ];
    vi.mocked(commentService.getCharacterComments).mockResolvedValue(commentsWithAuthor);
    vi.mocked(commentService.deleteComment).mockResolvedValue(undefined);

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Reviewer')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/supprimer mon avis/i));

    await waitFor(() => {
      expect(screen.getByText('Confirmer ?')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Oui'));

    await waitFor(() => {
      expect(commentService.deleteComment).toHaveBeenCalledWith(5, 'fake-token');
    });
  });

  it('should show pending card when user has a pending comment', async () => {
    vi.mocked(commentService.getMyComment).mockResolvedValue({
      id: 99,
      rating: 4,
      text: 'Mon avis en attente de modération.',
      status: 'Pending',
      commentedAt: '2025-06-10T10:00:00Z',
      characterId: 1,
      authorId: 20,
      authorPseudo: 'Reviewer',
    });
    vi.mocked(commentService.getCharacterComments).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Votre avis')).toBeInTheDocument();
      expect(screen.getByText('En attente de validation')).toBeInTheDocument();
      expect(screen.getByText('Mon avis en attente de modération.')).toBeInTheDocument();
    });

    expect(screen.queryByText('Donner votre avis')).not.toBeInTheDocument();
  });

  it('should not show comment section for non-approved characters', async () => {
    vi.mocked(characterService.getCharacterPublic).mockResolvedValue({
      ...approvedCharacter,
      status: 'Draft',
      isOwner: true,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Arthas' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: /avis/i })).not.toBeInTheDocument();
  });
});
