import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getArticlesManage,
  createArticle,
  updateArticle,
  toggleArticleActive,
  deleteArticle,
  getArticleManageById,
} from '../../services/articleService';
import { fetchEquipmentSlots, fetchArticleTypes, type EquipmentSlot, type ArticleType } from '../../services/referenceDataService';
import type { ArticleSummaryResponse, ArticleResponse, PagedResponse } from '../../types';
import { Alert, Button, Input, Select, Pagination, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from '../ui';

export function ArticleManagementTab() {
  const { token } = useAuth();

  // ── Filters ────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  // ── Data ───────────────────────────────────────────────────────
  const [data, setData] = useState<PagedResponse<ArticleSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  // ── Reference data ─────────────────────────────────────────────
  const [slots, setSlots] = useState<EquipmentSlot[]>([]);
  const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);

  // ── Modal state ────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formTypeId, setFormTypeId] = useState<string>('');
  const [formSlotId, setFormSlotId] = useState<string>('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ── Delete confirmation ────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ArticleSummaryResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const articles = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  // ── Load reference data ────────────────────────────────────────
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [slotsData, typesData] = await Promise.all([
          fetchEquipmentSlots(),
          fetchArticleTypes(),
        ]);
        setSlots(slotsData);
        setArticleTypes(typesData);
      } catch {
        // Reference data will be empty, selects will just not show options
      }
    };
    loadReferenceData();
  }, []);

  // ── Debounce search ────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch articles ─────────────────────────────────────────────
  const fetchArticles = useCallback(async () => {
    if (!token) return;

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const isActive = selectedStatus === '' ? null : selectedStatus === 'true';
      const result = await getArticlesManage(
        page,
        token,
        debouncedSearch || undefined,
        selectedSlotId ? Number(selectedSlotId) : undefined,
        selectedTypeId ? Number(selectedTypeId) : undefined,
        isActive,
        'nameAsc'
      );

      if (currentRequestId === requestIdRef.current) {
        setData(result);
      }
    } catch (err: unknown) {
      if (currentRequestId === requestIdRef.current) {
        const apiError = err as { message?: string };
        setError(apiError?.message || 'Erreur lors du chargement des articles.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [token, page, debouncedSearch, selectedSlotId, selectedTypeId, selectedStatus]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ── Auto-dismiss success message ───────────────────────────────
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ── Modal handlers ─────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingArticle(null);
    setFormName('');
    setFormTypeId('');
    setFormSlotId('');
    setFormImage(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (article: ArticleSummaryResponse) => {
    if (!token) return;
    try {
      const full = await getArticleManageById(article.id, token);
      setEditingArticle(full);
      setFormName(full.name);
      setFormTypeId(String(full.typeId));
      setFormSlotId(String(full.slotId));
      setFormImage(full.imageBase64);
      setFormError(null);
      setIsModalOpen(true);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Erreur lors du chargement de l\'article.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setFormError('L\'image ne doit pas dépasser 500 Ko.');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFormError('Le fichier doit être une image (PNG, JPG, WebP).');
      e.target.value = '';
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (img.width > 512 || img.height > 512) {
        setFormError(`L'image ne doit pas dépasser 512x512 pixels (actuel : ${img.width}x${img.height}).`);
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setFormImage(base64);
        setFormError(null);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setFormError('Impossible de lire l\'image.');
      e.target.value = '';
    };

    img.src = objectUrl;
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (!formName.trim()) {
      setFormError('Le nom est obligatoire.');
      return;
    }
    if (!formTypeId) {
      setFormError('Le type est obligatoire.');
      return;
    }
    if (!formSlotId) {
      setFormError('L\'emplacement est obligatoire.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      if (editingArticle) {
        await updateArticle(
          editingArticle.id,
          {
            name: formName.trim(),
            typeId: Number(formTypeId),
            slotId: Number(formSlotId),
            imageBase64: formImage,
          },
          token
        );
        setSuccessMessage('Article mis à jour avec succès.');
      } else {
        await createArticle(
          {
            name: formName.trim(),
            typeId: Number(formTypeId),
            slotId: Number(formSlotId),
            imageBase64: formImage,
          },
          token
        );
        setSuccessMessage('Article créé avec succès.');
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setFormError(apiError?.message || 'Une erreur est survenue.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────────
  const handleToggleActive = async (article: ArticleSummaryResponse) => {
    if (!token) return;
    try {
      await toggleArticleActive(article.id, token);
      setSuccessMessage(
        article.isActive
          ? `"${article.name}" a été désactivé.`
          : `"${article.name}" a été activé.`
      );
      fetchArticles();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Erreur lors du changement de statut.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!token || !deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteArticle(deleteTarget.id, token);
      setSuccessMessage(`"${deleteTarget.name}" a été supprimé.`);
      setDeleteTarget(null);
      fetchArticles();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setDeleteError(apiError?.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Select options ─────────────────────────────────────────────
  const slotOptions = [
    { value: '', label: 'Tous les emplacements' },
    ...slots.map(s => ({ value: String(s.id), label: s.name })),
  ];

  const typeOptions = [
    { value: '', label: 'Tous les types' },
    ...articleTypes.map(t => ({ value: String(t.id), label: t.name })),
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'true', label: 'Actifs' },
    { value: 'false', label: 'Inactifs' },
  ];

  const formTypeOptions = articleTypes.map(t => ({ value: String(t.id), label: t.name }));
  const formSlotOptions = slots.map(s => ({ value: String(s.id), label: s.name }));

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-cream-400">
          Gérez les articles de personnalisation disponibles pour les personnages.
        </p>
        <Button variant="primary" onClick={openCreateModal}>
          Nouvel article
        </Button>
      </div>

      {successMessage && (
        <div className="mb-6">
          <Alert variant="success">{successMessage}</Alert>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Rechercher un article..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          options={typeOptions}
          value={selectedTypeId}
          onChange={e => { setSelectedTypeId(e.target.value); setPage(1); }}
        />
        <Select
          options={slotOptions}
          value={selectedSlotId}
          onChange={e => { setSelectedSlotId(e.target.value); setPage(1); }}
        />
        <Select
          options={statusOptions}
          value={selectedStatus}
          onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}
        />
      </div>

      {/* Articles list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-cream-500 text-lg">Aucun article trouvé.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-cream-400 w-12">Image</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">Emplacement</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-cream-400">Statut</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-cream-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr
                    key={article.id}
                    className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="py-2 px-4">
                      {article.imageBase64 ? (
                        <img
                          src={`data:image/png;base64,${article.imageBase64}`}
                          alt={article.name}
                          className="w-10 h-10 object-cover rounded-lg border border-dark-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dark-700 bg-dark-800 flex items-center justify-center">
                          <svg className="w-5 h-5 text-cream-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-cream-200 font-medium">{article.name}</td>
                    <td className="py-3 px-4 text-cream-300">{article.typeName}</td>
                    <td className="py-3 px-4 text-cream-300">{article.slotName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={article.isActive ? 'success' : 'warning'} size="sm">
                        {article.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(article)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(article)}
                        >
                          {article.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setDeleteTarget(article); setDeleteError(null); }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
        </ModalHeader>
        <ModalBody>
          {formError && (
            <div className="mb-4">
              <Alert variant="error">{formError}</Alert>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Input
              label="Nom de l'article"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Ex: Épée en acier"
            />
            <Select
              label="Type"
              options={formTypeOptions}
              value={formTypeId}
              onChange={e => setFormTypeId(e.target.value)}
              placeholder="Sélectionner un type"
            />
            <Select
              label="Emplacement"
              options={formSlotOptions}
              value={formSlotId}
              onChange={e => setFormSlotId(e.target.value)}
              placeholder="Sélectionner un emplacement"
            />
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-1">
                Image (optionnel, max 500 Ko, 512x512 px)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-cream-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-dark-700 file:text-cream-200 hover:file:bg-dark-600 file:cursor-pointer file:transition-colors"
              />
              {formImage && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={`data:image/png;base64,${formImage}`}
                    alt="Aperçu"
                    className="w-16 h-16 object-cover rounded-lg border border-dark-700"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormImage(null)}
                  >
                    Supprimer l'image
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={formLoading}
          >
            {formLoading ? 'Enregistrement...' : editingArticle ? 'Mettre à jour' : 'Créer'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <ModalHeader onClose={() => setDeleteTarget(null)}>
          Confirmer la suppression
        </ModalHeader>
        <ModalBody>
          {deleteError && (
            <div className="mb-4">
              <Alert variant="error">{deleteError}</Alert>
            </div>
          )}
          <p className="text-cream-300">
            Êtes-vous sûr de vouloir supprimer l'article <strong className="text-cream-100">"{deleteTarget?.name}"</strong> ?
            Cette action est irréversible.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
