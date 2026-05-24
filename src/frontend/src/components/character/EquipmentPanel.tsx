import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, ModalHeader, ModalBody, Alert, Button } from '../ui';
import { getEquipment, equipArticle, unequipArticle } from '../../services/characterService';
import { getArticles } from '../../services/articleService';
import { fetchEquipmentSlots, type EquipmentSlot } from '../../services/referenceDataService';
import type { EquippedArticleResponse, ArticleSummaryResponse } from '../../types';

interface EquipmentPanelProps {
  characterId: number;
  readOnly?: boolean;
}

const EquipmentPanel = ({ characterId, readOnly = false }: EquipmentPanelProps) => {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState<EquippedArticleResponse[]>([]);
  const [slots, setSlots] = useState<EquipmentSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSlot, setActiveSlot] = useState<EquipmentSlot | null>(null);
  const [slotArticles, setSlotArticles] = useState<ArticleSummaryResponse[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadEquipment = useCallback(async () => {
    if (!token) return;
    const eq = await getEquipment(characterId, token);
    setEquipment(eq);
  }, [characterId, token]);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    Promise.all([getEquipment(characterId, token), fetchEquipmentSlots()])
      .then(([eq, sl]) => {
        setEquipment(eq);
        setSlots([...sl].sort((a, b) => a.displayOrder - b.displayOrder));
      })
      .catch(() => setError("Impossible de charger l'équipement."))
      .finally(() => setIsLoading(false));
  }, [characterId, token]);

  const handleOpenSlot = useCallback(
    (slot: EquipmentSlot) => {
      if (readOnly) return;
      setActiveSlot(slot);
      setSaveError(null);
      setIsLoadingArticles(true);
      getArticles(1, undefined, slot.id, undefined, 'nameAsc')
        .then((res) => setSlotArticles(res.items))
        .catch(() => setSlotArticles([]))
        .finally(() => setIsLoadingArticles(false));
    },
    [readOnly]
  );

  const handleEquip = async (articleId: number) => {
    if (!token || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await equipArticle(characterId, articleId, token);
      await loadEquipment();
      setActiveSlot(null);
    } catch {
      setSaveError("Impossible d'équiper cet article.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnequip = async (articleId: number) => {
    if (!token || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await unequipArticle(characterId, articleId, token);
      await loadEquipment();
      setActiveSlot(null);
    } catch {
      setSaveError("Impossible de retirer cet article.");
    } finally {
      setIsSaving(false);
    }
  };

  const equippedForSlot = (slotId: number) =>
    equipment.find((e) => e.slotId === slotId);

  if (isLoading) {
    return (
      <section
        aria-labelledby="equipment-heading"
        className="mt-6 bg-dark-900/50 border border-dark-700 rounded-xl p-5"
      >
        <h2 id="equipment-heading" className="text-lg font-medium text-cream-100 mb-4">
          Équipement
        </h2>
        <p className="text-cream-500 text-sm">Chargement…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-labelledby="equipment-heading"
        className="mt-6 bg-dark-900/50 border border-dark-700 rounded-xl p-5"
      >
        <h2 id="equipment-heading" className="text-lg font-medium text-cream-100 mb-4">
          Équipement
        </h2>
        <Alert variant="error">{error}</Alert>
      </section>
    );
  }

  const activeEquipped = activeSlot ? equippedForSlot(activeSlot.id) : undefined;

  return (
    <>
      <section
        aria-labelledby="equipment-heading"
        className="mt-6 bg-dark-900/50 border border-dark-700 rounded-xl p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <h2 id="equipment-heading" className="text-lg font-medium text-cream-100">
            Équipement
          </h2>
          {!readOnly && (
            <span className="text-xs text-cream-500">
              Cliquez sur un slot pour équiper un article
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {slots.map((slot) => {
            const equipped = equippedForSlot(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleOpenSlot(slot)}
                disabled={readOnly}
                aria-label={`${slot.name}${equipped ? ` : ${equipped.name}` : ' : vide'}`}
                className={[
                  'flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-colors',
                  readOnly
                    ? 'cursor-default border-dark-700'
                    : 'cursor-pointer hover:border-gold-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                  equipped
                    ? 'bg-dark-800 border-gold-500/30'
                    : 'bg-dark-800/40 border-dark-700 border-dashed',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-10 h-10 rounded flex items-center justify-center',
                    equipped ? 'bg-dark-700' : 'border-2 border-dashed border-dark-600',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {equipped ? (
                    <span className="text-gold-400 text-base">✦</span>
                  ) : (
                    <span className="text-dark-500 text-xl">+</span>
                  )}
                </span>

                {equipped ? (
                  <>
                    <span className="text-xs text-cream-200 font-medium leading-tight line-clamp-2 w-full">
                      {equipped.name}
                    </span>
                    <span className="text-xs text-cream-500">{equipped.typeName}</span>
                    <span className="text-xs text-gold-400/70 font-medium">{slot.name}</span>
                  </>
                ) : (
                  <span className="text-xs text-cream-500 leading-tight">{slot.name}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {!readOnly && activeSlot && (
        <Modal isOpen onClose={() => setActiveSlot(null)} size="xl">
          <ModalHeader onClose={() => setActiveSlot(null)}>
            Équiper — {activeSlot.name}
          </ModalHeader>
          <ModalBody>
            {saveError && (
              <Alert variant="error" className="mb-4">
                {saveError}
              </Alert>
            )}

            {activeEquipped && (
              <div className="mb-4 flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div>
                  <p className="text-xs text-cream-500 mb-0.5">Article équipé</p>
                  <p className="text-cream-200 font-medium text-sm">{activeEquipped.name}</p>
                  <p className="text-xs text-cream-500">{activeEquipped.typeName}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleUnequip(activeEquipped.articleId)}
                  disabled={isSaving}
                  aria-label={`Retirer ${activeEquipped.name}`}
                >
                  Retirer
                </Button>
              </div>
            )}

            {isLoadingArticles ? (
              <p className="text-cream-500 text-sm py-6 text-center">Chargement des articles…</p>
            ) : slotArticles.length === 0 ? (
              <p className="text-cream-500 text-sm py-6 text-center">
                Aucun article disponible pour ce slot.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {slotArticles.map((article) => {
                  const isEquipped = activeEquipped?.articleId === article.id;
                  return (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => !isEquipped && handleEquip(article.id)}
                      disabled={isSaving || isEquipped}
                      aria-pressed={isEquipped}
                      aria-label={`${isEquipped ? 'Équipé : ' : 'Équiper '}${article.name}`}
                      className={[
                        'flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                        'disabled:opacity-50',
                        isEquipped
                          ? 'bg-gold-500/10 border-gold-500 cursor-default'
                          : 'bg-dark-700 border-dark-600 hover:border-gold-500/50 cursor-pointer',
                      ].join(' ')}
                    >
                      <div className="w-12 h-12 rounded bg-dark-800 flex items-center justify-center overflow-hidden">
                        {article.imageBase64 ? (
                          <img
                            src={`data:image/png;base64,${article.imageBase64}`}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-dark-500 text-2xl" aria-hidden="true">
                            ✦
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-cream-200 font-medium leading-tight line-clamp-2 w-full">
                        {article.name}
                      </span>
                      <span className="text-xs text-cream-500">{article.typeName}</span>
                      {isEquipped && (
                        <span className="text-xs text-gold-400 font-medium">✓ Équipé</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default EquipmentPanel;
