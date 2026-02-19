import { useState, useEffect, useCallback, useRef } from 'react';
import { getGallery } from '../services/characterService';
import type { GalleryCharacter, GalleryGender, GallerySort, PagedResponse } from '../types';
import { useDebounce } from '../hooks';
import { Header, Footer } from '../components/layout';
import { GalleryCard } from '../components/character';
import { Alert, Pagination } from '../components/ui';

const SORT_OPTIONS: { value: GallerySort; label: string }[] = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'nameAsc', label: 'Nom A-Z' },
];

const GENDER_OPTIONS: { value: '' | GalleryGender; label: string }[] = [
  { value: '', label: 'Tous les genres' },
  { value: 'Male', label: 'Masculin' },
  { value: 'Female', label: 'Féminin' },
];

export default function GalleryPage() {
  const [data, setData] = useState<PagedResponse<GalleryCharacter> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [gender, setGender] = useState<'' | GalleryGender>('');
  const [author, setAuthor] = useState('');
  const [sort, setSort] = useState<GallerySort>('recent');

  const debouncedAuthor = useDebounce(author, 300);
  const requestIdRef = useRef(0);

  const characters = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;

  const fetchGallery = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setError(null);
    setIsLoading(true);
    try {
      const result = await getGallery({
        gender: gender || undefined,
        author: debouncedAuthor || undefined,
        sort,
        page,
      });
      if (currentRequestId !== requestIdRef.current) return;
      setData(result);
    } catch {
      if (currentRequestId !== requestIdRef.current) return;
      setError('Impossible de charger la galerie.');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, gender, debouncedAuthor, sort]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleGenderChange = (value: string) => {
    setGender(value as '' | GalleryGender);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value as GallerySort);
    setPage(1);
  };

  const handleAuthorChange = (value: string) => {
    setAuthor(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-display text-gold-300">
              Galerie des personnages
            </h1>
            <p className="mt-2 text-cream-400">
              Explorez les créations partagées par la communauté.
            </p>
          </div>

          <section
            aria-label="Filtres"
            className="flex flex-wrap gap-3 mb-8 bg-dark-900/50 border border-dark-700 rounded-xl p-4"
          >
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="author-search" className="sr-only">
                Rechercher par pseudo du créateur
              </label>
              <input
                id="author-search"
                type="text"
                placeholder="Rechercher par pseudo..."
                value={author}
                onChange={(e) => handleAuthorChange(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-cream-200 placeholder-dark-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label htmlFor="gender-filter" className="sr-only">
                Filtrer par genre
              </label>
              <select
                id="gender-filter"
                value={gender}
                onChange={(e) => handleGenderChange(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort-select" className="sr-only">
                Trier par
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {!isLoading && !error && totalCount > 0 && (
            <p className="text-sm text-cream-400 mb-4">
              {totalCount} personnage{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
            </p>
          )}

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {isLoading && (
            <div className="flex justify-center py-20" role="status" aria-label="Chargement">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
            </div>
          )}

          {!isLoading && !error && characters.length === 0 && (
            <div className="text-center py-20">
              <p className="text-cream-400 text-lg">Aucun personnage trouvé.</p>
            </div>
          )}

          {!isLoading && !error && characters.length > 0 && (
            <ul
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0"
              aria-label="Liste des personnages"
            >
              {characters.map((character) => (
                <li key={character.id}>
                  <GalleryCard character={character} />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
