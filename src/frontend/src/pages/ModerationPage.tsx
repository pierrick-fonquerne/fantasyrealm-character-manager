import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPendingCharacters,
  approveCharacter,
  rejectCharacter,
  getPendingComments,
  approveComment,
  rejectComment,
  getUsers,
  getUsersCount,
  suspendUser,
  reactivateUser,
  deleteUser,
} from '../services/moderationService';
import type { PendingCharacter, PendingComment, UserManagement, PagedResponse } from '../types';
import { Header, Footer } from '../components/layout';
import {
  ModerationCard,
  CommentModerationCard,
  UserModerationCard,
  RejectReasonModal,
  SuspendReasonModal,
  ConfirmDeleteModal,
  ModerationStats,
  ArticleManagementTab,
} from '../components/moderation';
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

  // ── Users state ──────────────────────────────────────────────────
  const [userData, setUserData] = useState<PagedResponse<UserManagement> | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [userProcessingId, setUserProcessingId] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState(0);
  const userRequestIdRef = useRef(0);

  const users = userData?.items ?? [];
  const userTotalPages = userData?.totalPages ?? 0;

  // ── Reject modal (characters + comments) ─────────────────────────
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    type: 'character' | 'comment';
    id: number | null;
    targetName: string;
  }>({ isOpen: false, type: 'character', id: null, targetName: '' });
  const [isRejecting, setIsRejecting] = useState(false);

  // ── Suspend modal ────────────────────────────────────────────────
  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    id: number | null;
    targetName: string;
  }>({ isOpen: false, id: null, targetName: '' });
  const [isSuspending, setIsSuspending] = useState(false);
  const suspendKeyRef = useRef(0);

  // ── Delete modal ─────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    targetName: string;
  }>({ isOpen: false, id: null, targetName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch characters ─────────────────────────────────────────────
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

  // ── Fetch comments ───────────────────────────────────────────────
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

  // ── Fetch users ──────────────────────────────────────────────────
  const isSuspendedFilter = userFilter === 'all' ? null : userFilter === 'suspended';

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    const currentRequestId = ++userRequestIdRef.current;
    setUserError(null);
    setUserLoading(true);
    try {
      const result = await getUsers(userPage, userSearch, isSuspendedFilter, token);
      if (currentRequestId !== userRequestIdRef.current) return;
      setUserData(result);
    } catch {
      if (currentRequestId !== userRequestIdRef.current) return;
      setUserError('Impossible de charger les utilisateurs.');
    } finally {
      if (currentRequestId === userRequestIdRef.current) {
        setUserLoading(false);
      }
    }
  }, [userPage, userSearch, isSuspendedFilter, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchUsersCount = useCallback(async () => {
    if (!token) return;
    try {
      const count = await getUsersCount(token);
      setUsersCount(count);
    } catch {
      // Silently fail for count
    }
  }, [token]);

  useEffect(() => {
    fetchUsersCount();
  }, [fetchUsersCount]);

  // ── Character handlers ───────────────────────────────────────────
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

  // ── Comment handlers ─────────────────────────────────────────────
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

  // ── User handlers ────────────────────────────────────────────────
  const handleSuspendOpen = (id: number) => {
    const user = users.find((u) => u.id === id);
    suspendKeyRef.current += 1;
    setSuspendModal({ isOpen: true, id, targetName: user?.pseudo ?? '' });
  };

  const handleSuspendClose = () => {
    setSuspendModal({ isOpen: false, id: null, targetName: '' });
  };

  const handleSuspendConfirm = async (reason: string) => {
    if (!token || suspendModal.id === null) return;
    setIsSuspending(true);
    setUserError(null);
    try {
      await suspendUser(suspendModal.id, reason, token);
      handleSuspendClose();
      await fetchUsers();
    } catch {
      setUserError('Erreur lors de la suspension du compte.');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleReactivate = async (id: number) => {
    if (!token) return;
    setUserProcessingId(id);
    setUserError(null);
    try {
      await reactivateUser(id, token);
      await fetchUsers();
    } catch {
      setUserError('Erreur lors de la réactivation du compte.');
    } finally {
      setUserProcessingId(null);
    }
  };

  const handleDeleteOpen = (id: number) => {
    const user = users.find((u) => u.id === id);
    setDeleteModal({ isOpen: true, id, targetName: user?.pseudo ?? '' });
  };

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, id: null, targetName: '' });
  };

  const handleDeleteConfirm = async () => {
    if (!token || deleteModal.id === null) return;
    setIsDeleting(true);
    setUserError(null);
    try {
      await deleteUser(deleteModal.id, token);
      setUserData((prev) => {
        if (!prev) return prev;
        const filtered = prev.items.filter((u) => u.id !== deleteModal.id);
        return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
      });
      setUsersCount((prev) => Math.max(0, prev - 1));
      handleDeleteClose();
    } catch {
      setUserError('Erreur lors de la suppression du compte.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Auto-fallback to previous page when empty ────────────────────
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

  useEffect(() => {
    if (!userLoading && userData && userData.items.length === 0 && userPage > 1) {
      setUserPage(userPage - 1);
    }
  }, [userData, userLoading, userPage]);

  // ── Search debounce: reset page when search/filter changes ───────
  useEffect(() => {
    setUserPage(1);
  }, [userSearch, userFilter]);

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
              Gérez les personnages, commentaires et comptes utilisateurs.
            </p>
          </div>

          <ModerationStats
            pendingCharactersCount={charTotalCount}
            pendingCommentsCount={commentTotalCount}
            usersCount={usersCount}
            isLoading={charLoading || commentLoading || userLoading}
          />

          <Tabs defaultTab="characters">
            <TabsList className="mb-6" aria-label="Sections de modération">
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
              <Tab
                value="users"
                badge={
                  !userLoading && usersCount > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full bg-dark-600 text-cream-300">
                      {usersCount}
                    </span>
                  ) : undefined
                }
              >
                Utilisateurs
              </Tab>
              <Tab value="articles">
                Articles
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

            {/* ── Users Panel ───────────────────────────────────────── */}
            <TabsPanel value="users">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Rechercher par pseudo ou email…"
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 placeholder-cream-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                    aria-label="Rechercher un utilisateur"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value as 'all' | 'active' | 'suspended')}
                  className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="suspended">Suspendus</option>
                </select>
              </div>

              {userError && (
                <Alert variant="error" className="mb-6">
                  <div className="flex items-center justify-between">
                    <span>{userError}</span>
                    <button
                      type="button"
                      onClick={fetchUsers}
                      className="ml-4 text-sm font-medium underline hover:no-underline"
                    >
                      Réessayer
                    </button>
                  </div>
                </Alert>
              )}

              {userLoading && (
                <div className="flex justify-center py-20" role="status" aria-label="Chargement">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
                </div>
              )}

              {!userLoading && !userError && users.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  <p className="text-cream-500 text-lg">
                    {userSearch || userFilter !== 'all'
                      ? 'Aucun utilisateur ne correspond à votre recherche.'
                      : 'Aucun utilisateur enregistré.'}
                  </p>
                </div>
              )}

              {!userLoading && !userError && users.length > 0 && (
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0"
                  aria-label="Liste des utilisateurs"
                >
                  {users.map((user) => (
                    <li key={user.id}>
                      <UserModerationCard
                        user={user}
                        onSuspend={handleSuspendOpen}
                        onReactivate={handleReactivate}
                        onDelete={handleDeleteOpen}
                        isProcessing={userProcessingId === user.id}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {userTotalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={userPage}
                    totalPages={userTotalPages}
                    onChange={setUserPage}
                  />
                </div>
              )}
            </TabsPanel>

            {/* ── Articles Panel ──────────────────────────────────── */}
            <TabsPanel value="articles">
              <ArticleManagementTab />
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

      <SuspendReasonModal
        key={`suspend-${suspendKeyRef.current}`}
        isOpen={suspendModal.isOpen}
        targetName={suspendModal.targetName}
        onConfirm={handleSuspendConfirm}
        onClose={handleSuspendClose}
        isSubmitting={isSuspending}
      />

      <ConfirmDeleteModal
        key={`delete-${deleteModal.id}`}
        isOpen={deleteModal.isOpen}
        targetName={deleteModal.targetName}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteClose}
        isSubmitting={isDeleting}
      />
    </div>
  );
}
