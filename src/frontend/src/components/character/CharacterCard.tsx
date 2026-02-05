import { Link } from 'react-router-dom';
import { Button, Badge } from '../ui';
import { EditIcon, DuplicateIcon, DeleteIcon, ShareIcon } from '../ui/icons';
import { MiniPreview } from './MiniPreview';
import type { CharacterSummary } from '../../services/characterService';

interface CharacterCardProps {
  character: CharacterSummary;
  onEdit?: (id: number) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onToggleShare?: (id: number) => void;
  isDeleting?: boolean;
  isDuplicating?: boolean;
  isTogglingShare?: boolean;
}

const STATUS_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'error' }
> = {
  Draft: { label: 'Brouillon', variant: 'default' },
  Pending: { label: 'En attente', variant: 'info' },
  Approved: { label: 'Approuvé', variant: 'success' },
  Rejected: { label: 'Rejeté', variant: 'error' },
};

const GENDER_LABELS: Record<string, string> = {
  Male: 'Masculin',
  Female: 'Féminin',
};

export function CharacterCard({
  character,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleShare,
  isDeleting = false,
  isDuplicating = false,
  isTogglingShare = false,
}: CharacterCardProps) {
  const badge = STATUS_BADGE[character.status] ?? STATUS_BADGE.Draft;
  const genderLabel = GENDER_LABELS[character.gender] ?? character.gender;
  const isApproved = character.status === 'Approved';
  const canEdit = character.status === 'Draft' || character.status === 'Rejected';

  const hasActions =
    (canEdit && onEdit) ||
    (isApproved && onDuplicate) ||
    (isApproved && onToggleShare) ||
    onDelete;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-colors">
      {/* Header with preview and info */}
      <div className="flex gap-4">
        <MiniPreview
          skinColor={character.skinColor}
          hairColor={character.hairColor}
          eyeColor={character.eyeColor}
          faceShape={character.faceShape}
          hairStyle={character.hairStyle}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/characters/${character.id}`}
              className="flex-1 min-w-0 group"
            >
              <h3 className="text-lg font-medium text-cream-100 group-hover:text-gold-400 transition-colors truncate">
                {character.name}
              </h3>
              <p className="text-sm text-cream-400 mt-0.5">
                {character.className} · {genderLabel}
              </p>
            </Link>

            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>

          {isApproved && (
            <span
              className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
                character.isShared
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'bg-dark-700 text-cream-500'
              }`}
            >
              {character.isShared ? 'Partagé' : 'Privé'}
            </span>
          )}
        </div>
      </div>

      {/* Actions - only render if there are actions to show */}
      {hasActions && (
        <div className="mt-4 pt-4 border-t border-dark-700 flex flex-wrap gap-2">
          {canEdit && onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(character.id)}
              aria-label={`Modifier ${character.name}`}
            >
              <EditIcon />
              <span className="ml-1.5">Modifier</span>
            </Button>
          )}

          {isApproved && onDuplicate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onDuplicate}
              disabled={isDuplicating}
              aria-label={`Dupliquer ${character.name}`}
            >
              <DuplicateIcon />
              <span className="ml-1.5">
                {isDuplicating ? 'Duplication...' : 'Dupliquer'}
              </span>
            </Button>
          )}

          {isApproved && onToggleShare && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleShare(character.id)}
              disabled={isTogglingShare}
              aria-label={
                character.isShared
                  ? `Rendre ${character.name} privé`
                  : `Partager ${character.name}`
              }
            >
              <ShareIcon isShared={!!character.isShared} />
              <span className="ml-1.5">
                {isTogglingShare
                  ? 'En cours...'
                  : character.isShared
                    ? 'Rendre privé'
                    : 'Partager'}
              </span>
            </Button>
          )}

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              aria-label={`Supprimer ${character.name}`}
            >
              <DeleteIcon />
              <span className="ml-1.5">
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
