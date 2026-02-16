import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { Button } from '../components/ui';
import { CharacterCard, DeleteConfirmModal, DuplicateModal } from '../components/character';
import { useAuth } from '../context/AuthContext';
import {
  getMyCharacters,
  deleteCharacter,
  duplicateCharacter,
  toggleShareCharacter,
} from '../services/characterService';
import type { CharacterSummary } from '../types';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    character: CharacterSummary | null;
  }>({ isOpen: false, character: null });
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    character: CharacterSummary | null;
  }>({ isOpen: false, character: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [togglingShareId, setTogglingShareId] = useState<number | null>(null);

  const fetchCharacters = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await getMyCharacters(token);
      setCharacters(data);
    } catch {
      setError('Impossible de charger vos personnages.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleEdit = (id: number) => {
    navigate(`/characters/${id}/edit`);
  };

  const openDuplicateModal = (character: CharacterSummary) => {
    setDuplicateModal({ isOpen: true, character });
  };

  const closeDuplicateModal = () => {
    setDuplicateModal({ isOpen: false, character: null });
  };

  const confirmDuplicate = async (newName: string) => {
    if (!token || !duplicateModal.character) return;
    setIsDuplicating(true);
    try {
      await duplicateCharacter(duplicateModal.character.id, newName, token);
      await fetchCharacters();
      closeDuplicateModal();
    } catch {
      setError('Impossible de dupliquer le personnage.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleToggleShare = async (id: number) => {
    if (!token) return;
    setTogglingShareId(id);
    try {
      const updated = await toggleShareCharacter(id, token);
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isShared: updated.isShared } : c
        )
      );
    } catch {
      setError('Impossible de modifier le partage.');
    } finally {
      setTogglingShareId(null);
    }
  };

  const openDeleteModal = (character: CharacterSummary) => {
    setDeleteModal({ isOpen: true, character });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, character: null });
  };

  const confirmDelete = async () => {
    if (!token || !deleteModal.character) return;
    setIsDeleting(true);
    try {
      await deleteCharacter(deleteModal.character.id, token);
      setCharacters((prev) =>
        prev.filter((c) => c.id !== deleteModal.character!.id)
      );
      closeDeleteModal();
    } catch {
      setError('Impossible de supprimer le personnage.');
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = {
    total: characters.length,
    approved: characters.filter((c) => c.status === 'Approved').length,
    pending: characters.filter((c) => c.status === 'Pending').length,
    draft: characters.filter((c) => c.status === 'Draft').length,
    rejected: characters.filter((c) => c.status === 'Rejected').length,
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

      <main id="main-content" role="main" className="flex-1 px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gold-500">
                Bienvenue, <span className="text-cream-100">{user?.pseudo}</span>
              </h1>
              <p className="text-cream-400 mt-2">
                Gérez vos personnages et créez de nouvelles aventures.
              </p>
            </div>
            <Link to="/characters/create">
              <Button variant="primary">Créer un personnage</Button>
            </Link>
          </div>

          {!isLoading && characters.length > 0 && (
            <section aria-label="Statistiques" className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cream-100">{stats.total}</p>
                  <p className="text-sm text-cream-400">Total</p>
                </div>
                <div className="bg-dark-800 border border-success-500/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-success-500">{stats.approved}</p>
                  <p className="text-sm text-cream-400">Approuvés</p>
                </div>
                <div className="bg-dark-800 border border-info-500/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-info-500">{stats.pending}</p>
                  <p className="text-sm text-cream-400">En attente</p>
                </div>
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cream-300">{stats.draft + stats.rejected}</p>
                  <p className="text-sm text-cream-400">Brouillons</p>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div
              className="mb-6 p-4 bg-error-500/10 border border-error-500/30 rounded-xl text-error-400"
              role="alert"
            >
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-4 underline hover:no-underline"
              >
                Fermer
              </button>
            </div>
          )}

          <section aria-label="Mes personnages">
            <h2 className="font-display text-xl text-cream-200 mb-4">
              Mes personnages
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500" />
                <span className="ml-3 text-cream-400">Chargement...</span>
              </div>
            ) : characters.length === 0 ? (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-cream-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="text-cream-400 mb-4">
                  Vous n'avez pas encore de personnage.
                </p>
                <Link to="/characters/create">
                  <Button variant="primary">Créer mon premier personnage</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onEdit={handleEdit}
                    onDuplicate={() => openDuplicateModal(character)}
                    onDelete={() => openDeleteModal(character)}
                    onToggleShare={handleToggleShare}
                    isDeleting={
                      deleteModal.character?.id === character.id && isDeleting
                    }
                    isDuplicating={
                      duplicateModal.character?.id === character.id && isDuplicating
                    }
                    isTogglingShare={togglingShareId === character.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        characterName={deleteModal.character?.name ?? ''}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting}
      />

      <DuplicateModal
        isOpen={duplicateModal.isOpen}
        characterName={duplicateModal.character?.name ?? ''}
        token={token}
        onConfirm={confirmDuplicate}
        onCancel={closeDuplicateModal}
        isDuplicating={isDuplicating}
      />
    </div>
  );
};

export default DashboardPage;
