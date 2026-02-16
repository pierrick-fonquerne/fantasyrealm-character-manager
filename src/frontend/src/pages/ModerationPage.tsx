import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingCharacters, approveCharacter, rejectCharacter } from '../services/moderationService';
import type { PendingCharacter, PagedResponse } from '../types';
import { Header, Footer } from '../components/layout';
import { ModerationCard, RejectReasonModal, ModerationStats } from '../components/moderation';
import { Alert, Pagination } from '../components/ui';

export default function ModerationPage() {
  const { token } = useAuth();

  const [data, setData] = useState<PagedResponse<PendingCharacter> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; character: PendingCharacter | null }>({
    isOpen: false,
    character: null,
  });
  const [isRejecting, setIsRejecting] = useState(false);

  const requestIdRef = useRef(0);

  const characters = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;

  const fetchPending = useCallback(async () => {
    if (!token) return;
    const currentRequestId = ++requestIdRef.current;
    setError(null);
    setIsLoading(true);
    try {
      const result = await getPendingCharacters(page, token);
      if (currentRequestId !== requestIdRef.current) return;
      setData(result);
    } catch {
      if (currentRequestId !== requestIdRef.current) return;
      setError('Impossible de charger les personnages en attente.');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, token]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: number) => {
    if (!token) return;
    setApprovingId(id);
    setError(null);
    try {
      await approveCharacter(id, token);
      setData((prev) => {
        if (!prev) return prev;
        const filtered = prev.items.filter((c) => c.id !== id);
        return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
      });
    } catch {
      setError("Erreur lors de l'approbation du personnage.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectOpen = (id: number) => {
    const character = characters.find((c) => c.id === id) ?? null;
    setRejectModal({ isOpen: true, character });
  };

  const handleRejectClose = () => {
    setRejectModal({ isOpen: false, character: null });
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!token || !rejectModal.character) return;
    setIsRejecting(true);
    setError(null);
    try {
      await rejectCharacter(rejectModal.character.id, reason, token);
      setData((prev) => {
        if (!prev) return prev;
        const filtered = prev.items.filter((c) => c.id !== rejectModal.character!.id);
        return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
      });
      handleRejectClose();
    } catch {
      setError('Erreur lors du rejet du personnage.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Si la page courante se vide après action et qu'on n'est pas en page 1, revenir en arrière
  useEffect(() => {
    if (!isLoading && data && data.items.length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [data, isLoading, page]);

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
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-display text-gold-300">
              Modération
            </h1>
            <p className="mt-2 text-cream-400">
              Gérez les personnages en attente de validation.
            </p>
          </div>

          <ModerationStats pendingCount={totalCount} isLoading={isLoading} />

          {error && (
            <Alert variant="error" className="mb-6">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={fetchPending}
                  className="ml-4 text-sm font-medium underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            </Alert>
          )}

          {isLoading && (
            <div className="flex justify-center py-20" role="status" aria-label="Chargement">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
            </div>
          )}

          {!isLoading && !error && characters.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-cream-500 text-lg">Aucun personnage en attente de modération.</p>
            </div>
          )}

          {!isLoading && !error && characters.length > 0 && (
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0"
              aria-label="Personnages en attente de modération"
            >
              {characters.map((character) => (
                <li key={character.id}>
                  <ModerationCard
                    character={character}
                    onApprove={handleApprove}
                    onReject={handleRejectOpen}
                    isApproving={approvingId === character.id}
                  />
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

      <RejectReasonModal
        key={rejectModal.character?.id}
        isOpen={rejectModal.isOpen}
        characterName={rejectModal.character?.name ?? ''}
        onConfirm={handleRejectConfirm}
        onClose={handleRejectClose}
        isSubmitting={isRejecting}
      />
    </div>
  );
}
