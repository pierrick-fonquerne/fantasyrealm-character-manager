import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPendingCharacters,
  approveCharacter,
  rejectCharacter,
  getPendingComments,
  approveComment,
  rejectComment,
} from '../services/moderationService';
import type { PendingCharacter, PendingComment, PagedResponse } from '../types';
import { Header, Footer } from '../components/layout';
import { ModerationCard, CommentModerationCard, RejectReasonModal, ModerationStats } from '../components/moderation';
import { Alert, Pagination } from '../components/ui';
import { Tabs, TabsList, Tab, TabsPanel } from '../components/ui/Tabs/Tabs';

export default function ModerationPage() {
  const { token } = useAuth();

  // ── Characters state ─────────────────────────────────────────────
  const [charData, setCharData] = useState<PagedResponse<PendingCharacter> | null>(null);
  const [charLoading, setCharLoading] = useState(true);
  const [charError, setCharError] = useState<string | null>(null);
  const [charPage, setCharPage] = useState(1);
  const [charApprovingId, setCharApprovingId] = useState<number | null>(null);
  const charRequestIdRef = useRef(0);

  const characters = charData?.items ?? [];
  const charTotalPages = charData?.totalPages ?? 0;
  const charTotalCount = charData?.totalCount ?? 0;

  // ── Comments state ───────────────────────────────────────────────
  const [commentData, setCommentData] = useState<PagedResponse<PendingComment> | null>(null);
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentPage, setCommentPage] = useState(1);
  const [commentApprovingId, setCommentApprovingId] = useState<number | null>(null);
  const commentRequestIdRef = useRef(0);

  const comments = commentData?.items ?? [];
  const commentTotalPages = commentData?.totalPages ?? 0;
  const commentTotalCount = commentData?.totalCount ?? 0;

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    type: 'character' | 'comment';
    id: number | null;
    targetName: string;
  }>({ isOpen: false, type: 'character', id: null, targetName: '' });
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchCharacters = useCallback(async () => {
    if (!token) return;
    const currentRequestId = ++charRequestIdRef.current;
    setCharError(null);
    setCharLoading(true);
    try {
      const result = await getPendingCharacters(charPage, token);
      if (currentRequestId !== charRequestIdRef.current) return;
      setCharData(result);
    } catch {
      if (currentRequestId !== charRequestIdRef.current) return;
      setCharError('Impossible de charger les personnages en attente.');
    } finally {
      if (currentRequestId === charRequestIdRef.current) {
        setCharLoading(false);
      }
    }
  }, [charPage, token]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const fetchComments = useCallback(async () => {
    if (!token) return;
    const currentRequestId = ++commentRequestIdRef.current;
    setCommentError(null);
    setCommentLoading(true);
    try {
      const result = await getPendingComments(commentPage, token);
      if (currentRequestId !== commentRequestIdRef.current) return;
      setCommentData(result);
    } catch {
      if (currentRequestId !== commentRequestIdRef.current) return;
      setCommentError('Impossible de charger les commentaires en attente.');
    } finally {
      if (currentRequestId === commentRequestIdRef.current) {
        setCommentLoading(false);
      }
    }
  }, [commentPage, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCharApprove = async (id: number) => {
    if (!token) return;
    setCharApprovingId(id);
    setCharError(null);
    try {
      await approveCharacter(id, token);
      setCharData((prev) => {
        if (!prev) return prev;
        const filtered = prev.items.filter((c) => c.id !== id);
        return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
      });
    } catch {
      setCharError("Erreur lors de l'approbation du personnage.");
    } finally {
      setCharApprovingId(null);
    }
  };

  const handleCharRejectOpen = (id: number) => {
    const character = characters.find((c) => c.id === id);
    setRejectModal({ isOpen: true, type: 'character', id, targetName: character?.name ?? '' });
  };

  const handleCommentApprove = async (id: number) => {
    if (!token) return;
    setCommentApprovingId(id);
    setCommentError(null);
    try {
      await approveComment(id, token);
      setCommentData((prev) => {
        if (!prev) return prev;
        const filtered = prev.items.filter((c) => c.id !== id);
        return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
      });
    } catch {
      setCommentError("Erreur lors de l'approbation du commentaire.");
    } finally {
      setCommentApprovingId(null);
    }
  };

  const handleCommentRejectOpen = (id: number) => {
    const comment = comments.find((c) => c.id === id);
    setRejectModal({
      isOpen: true,
      type: 'comment',
      id,
      targetName: comment ? `l'avis de ${comment.authorPseudo}` : '',
    });
  };

  // ── Reject confirm (shared) ──────────────────────────────────────
  const handleRejectClose = () => {
    setRejectModal({ isOpen: false, type: 'character', id: null, targetName: '' });
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!token || rejectModal.id === null) return;
    setIsRejecting(true);

    try {
      if (rejectModal.type === 'character') {
        setCharError(null);
        await rejectCharacter(rejectModal.id, reason, token);
        setCharData((prev) => {
          if (!prev) return prev;
          const filtered = prev.items.filter((c) => c.id !== rejectModal.id);
          return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
        });
      } else {
        setCommentError(null);
        await rejectComment(rejectModal.id, reason, token);
        setCommentData((prev) => {
          if (!prev) return prev;
          const filtered = prev.items.filter((c) => c.id !== rejectModal.id);
          return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
        });
      }
      handleRejectClose();
    } catch {
      if (rejectModal.type === 'character') {
        setCharError('Erreur lors du rejet du personnage.');
      } else {
        setCommentError('Erreur lors du rejet du commentaire.');
      }
    } finally {
      setIsRejecting(false);
    }
  };

  useEffect(() => {
    if (!charLoading && charData && charData.items.length === 0 && charPage > 1) {
      setCharPage(charPage - 1);
    }
  }, [charData, charLoading, charPage]);

  useEffect(() => {
    if (!commentLoading && commentData && commentData.items.length === 0 && commentPage > 1) {
      setCommentPage(commentPage - 1);
    }
  }, [commentData, commentLoading, commentPage]);

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
              Gérez les personnages et commentaires en attente de validation.
            </p>
          </div>

          <ModerationStats
            pendingCharactersCount={charTotalCount}
            pendingCommentsCount={commentTotalCount}
            isLoading={charLoading || commentLoading}
          />

          <Tabs defaultTab="characters">
            <TabsList className="mb-6">
              <Tab
                value="characters"
                badge={
                  !charLoading && charTotalCount > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full bg-gold-500 text-dark-950">
                      {charTotalCount}
                    </span>
                  ) : undefined
                }
              >
                Personnages
              </Tab>
              <Tab
                value="comments"
                badge={
                  !commentLoading && commentTotalCount > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full bg-gold-500 text-dark-950">
                      {commentTotalCount}
                    </span>
                  ) : undefined
                }
              >
                Commentaires
              </Tab>
            </TabsList>

            {/* ── Characters Panel ──────────────────────────────────── */}
            <TabsPanel value="characters">
              {charError && (
                <Alert variant="error" className="mb-6">
                  <div className="flex items-center justify-between">
                    <span>{charError}</span>
                    <button
                      type="button"
                      onClick={fetchCharacters}
                      className="ml-4 text-sm font-medium underline hover:no-underline"
                    >
                      Réessayer
                    </button>
                  </div>
                </Alert>
              )}

              {charLoading && (
                <div className="flex justify-center py-20" role="status" aria-label="Chargement">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
                </div>
              )}

              {!charLoading && !charError && characters.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-cream-500 text-lg">Aucun personnage en attente de modération.</p>
                </div>
              )}

              {!charLoading && !charError && characters.length > 0 && (
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0"
                  aria-label="Personnages en attente de modération"
                >
                  {characters.map((character) => (
                    <li key={character.id}>
                      <ModerationCard
                        character={character}
                        onApprove={handleCharApprove}
                        onReject={handleCharRejectOpen}
                        isApproving={charApprovingId === character.id}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {charTotalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={charPage}
                    totalPages={charTotalPages}
                    onChange={setCharPage}
                  />
                </div>
              )}
            </TabsPanel>

            {/* ── Comments Panel ────────────────────────────────────── */}
            <TabsPanel value="comments">
              {commentError && (
                <Alert variant="error" className="mb-6">
                  <div className="flex items-center justify-between">
                    <span>{commentError}</span>
                    <button
                      type="button"
                      onClick={fetchComments}
                      className="ml-4 text-sm font-medium underline hover:no-underline"
                    >
                      Réessayer
                    </button>
                  </div>
                </Alert>
              )}

              {commentLoading && (
                <div className="flex justify-center py-20" role="status" aria-label="Chargement">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
                </div>
              )}

              {!commentLoading && !commentError && comments.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-cream-500 text-lg">Aucun commentaire en attente de modération.</p>
                </div>
              )}

              {!commentLoading && !commentError && comments.length > 0 && (
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0"
                  aria-label="Commentaires en attente de modération"
                >
                  {comments.map((comment) => (
                    <li key={comment.id}>
                      <CommentModerationCard
                        comment={comment}
                        onApprove={handleCommentApprove}
                        onReject={handleCommentRejectOpen}
                        isApproving={commentApprovingId === comment.id}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {commentTotalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={commentPage}
                    totalPages={commentTotalPages}
                    onChange={setCommentPage}
                  />
                </div>
              )}
            </TabsPanel>
          </Tabs>
        </div>
      </main>

      <Footer />

      <RejectReasonModal
        key={`${rejectModal.type}-${rejectModal.id}`}
        isOpen={rejectModal.isOpen}
        targetName={rejectModal.targetName}
        onConfirm={handleRejectConfirm}
        onClose={handleRejectClose}
        isSubmitting={isRejecting}
      />
    </div>
  );
}
