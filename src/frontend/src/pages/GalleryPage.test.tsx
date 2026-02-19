import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import GalleryPage from './GalleryPage';
import type { GalleryCharacter, PagedResponse } from '../types';

expect.extend(toHaveNoViolations);

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    token: null,
    logout: vi.fn(),
  }),
}));

vi.mock('../services/characterService', () => ({
  getGallery: vi.fn().mockResolvedValue({
    items: [],
    page: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
  }),
}));

const mockCharacters = (): GalleryCharacter[] => [
  {
    id: 1,
    name: 'Arthas',
    className: 'Guerrier',
    gender: 'Male',
    authorPseudo: 'TestUser',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    skinColor: '#E8BEAC',
    hairColor: '#2C1810',
    eyeColor: '#4A90D9',
    faceShape: 'ovale',
    hairStyle: 'court',
    eyeShape: 'amande',
    noseShape: 'droit',
    mouthShape: 'fine',
  },
  {
    id: 2,
    name: 'Jaina',
    className: 'Mage',
    gender: 'Female',
    authorPseudo: 'AnotherUser',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
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

const pagedResponse = (
  items: GalleryCharacter[] = mockCharacters(),
  totalCount?: number,
  totalPages?: number
): PagedResponse<GalleryCharacter> => ({
  items,
  page: 1,
  pageSize: 12,
  totalCount: totalCount ?? items.length,
  totalPages: totalPages ?? 1,
});

const renderGallery = () =>
  render(
    <MemoryRouter initialEntries={['/galerie']}>
      <GalleryPage />
    </MemoryRouter>
  );

const setupWithCharacters = async (
  data?: PagedResponse<GalleryCharacter>
) => {
  const { getGallery } = await import('../services/characterService');
  vi.mocked(getGallery).mockResolvedValue(data ?? pagedResponse());
  renderGallery();
  await screen.findByText('Arthas');
};

describe('GalleryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('layout', () => {
    it('should render page title', async () => {
      renderGallery();

      expect(
        await screen.findByText(/galerie des personnages/i)
      ).toBeInTheDocument();
    });

    it('should render skip link', () => {
      renderGallery();

      const skipLink = screen.getByText(/aller au contenu principal/i);
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content landmark', () => {
      renderGallery();

      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });

    it('should render header and footer', () => {
      renderGallery();

      const logos = screen.getAllByText('FantasyRealm');
      expect(logos.length).toBeGreaterThan(0);
      expect(screen.getByText(/pixelverse studios/i)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner initially', () => {
      renderGallery();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no characters', async () => {
      renderGallery();

      expect(
        await screen.findByText(/aucun personnage trouvé/i)
      ).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error when fetch fails', async () => {
      const { getGallery } = await import('../services/characterService');
      vi.mocked(getGallery).mockRejectedValue(new Error('fail'));
      renderGallery();

      expect(
        await screen.findByText(/impossible de charger la galerie/i)
      ).toBeInTheDocument();
    });
  });

  describe('with characters', () => {
    it('should display character cards', async () => {
      await setupWithCharacters();

      expect(screen.getByText('Arthas')).toBeInTheDocument();
      expect(screen.getByText('Jaina')).toBeInTheDocument();
    });

    it('should display author pseudos', async () => {
      await setupWithCharacters();

      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText('AnotherUser')).toBeInTheDocument();
    });

    it('should display results count', async () => {
      await setupWithCharacters();

      expect(screen.getByText(/2 personnages trouvés/i)).toBeInTheDocument();
    });

    it('should have links to character detail', async () => {
      await setupWithCharacters();

      const links = screen.getAllByRole('link', { name: /voir/i });
      expect(links[0]).toHaveAttribute('href', '/characters/1');
      expect(links[1]).toHaveAttribute('href', '/characters/2');
    });

    it('should render a semantic list', async () => {
      await setupWithCharacters();

      const list = screen.getByRole('list', { name: /liste des personnages/i });
      expect(list.tagName).toBe('UL');

      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });
  });

  describe('filters', () => {
    it('should have gender filter', async () => {
      await setupWithCharacters();

      expect(screen.getByLabelText(/filtrer par genre/i)).toBeInTheDocument();
    });

    it('should have author search', async () => {
      await setupWithCharacters();

      expect(
        screen.getByLabelText(/rechercher par pseudo/i)
      ).toBeInTheDocument();
    });

    it('should have sort select', async () => {
      await setupWithCharacters();

      expect(screen.getByLabelText(/trier par/i)).toBeInTheDocument();
    });

    it('should call getGallery with gender filter', async () => {
      const user = userEvent.setup();
      const { getGallery } = await import('../services/characterService');
      vi.mocked(getGallery).mockResolvedValue(pagedResponse());
      renderGallery();
      await screen.findByText('Arthas');

      await user.selectOptions(
        screen.getByLabelText(/filtrer par genre/i),
        'Female'
      );

      await waitFor(() => {
        expect(getGallery).toHaveBeenCalledWith(
          expect.objectContaining({ gender: 'Female', page: 1 })
        );
      });
    });

    it('should debounce author search before calling getGallery', async () => {
      const user = userEvent.setup();
      const { getGallery } = await import('../services/characterService');
      vi.mocked(getGallery).mockResolvedValue(pagedResponse());
      renderGallery();
      await screen.findByText('Arthas');
      vi.mocked(getGallery).mockClear();

      const input = screen.getByLabelText(/rechercher par pseudo/i);
      await user.clear(input);
      await user.type(input, 'Test');

      expect(getGallery).not.toHaveBeenCalledWith(
        expect.objectContaining({ author: 'Test' })
      );

      await waitFor(() => {
        expect(getGallery).toHaveBeenCalledWith(
          expect.objectContaining({ author: 'Test', page: 1 })
        );
      }, { timeout: 1000 });
    });

    it('should call getGallery with sort option', async () => {
      const user = userEvent.setup();
      const { getGallery } = await import('../services/characterService');
      vi.mocked(getGallery).mockResolvedValue(pagedResponse());
      renderGallery();
      await screen.findByText('Arthas');

      await user.selectOptions(
        screen.getByLabelText(/trier par/i),
        'nameAsc'
      );

      await waitFor(() => {
        expect(getGallery).toHaveBeenCalledWith(
          expect.objectContaining({ sort: 'nameAsc', page: 1 })
        );
      });
    });
  });

  describe('pagination', () => {
    it('should show pagination when multiple pages', async () => {
      await setupWithCharacters(pagedResponse(mockCharacters(), 24, 2));

      expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
    });

    it('should not show pagination for single page', async () => {
      await setupWithCharacters(pagedResponse(mockCharacters(), 2, 1));

      expect(screen.queryByLabelText('Pagination')).not.toBeInTheDocument();
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { getGallery } = await import('../services/characterService');
      vi.mocked(getGallery).mockResolvedValue(pagedResponse());

      const { container } = renderGallery();
      await screen.findByText('Arthas');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
