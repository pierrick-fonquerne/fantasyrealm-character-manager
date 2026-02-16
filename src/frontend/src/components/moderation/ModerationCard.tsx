import { memo } from 'react';
import type { PendingCharacter } from '../../types';
import { MiniPreview } from '../character/MiniPreview';
import { CLASS_ICONS } from '../ui/icons';
import { Button } from '../ui';
import { formatRelativeDate } from '../../utils/formatRelativeDate';

interface ModerationCardProps {
  character: PendingCharacter;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isApproving: boolean;
}

export const ModerationCard = memo(function ModerationCard({
  character,
  onApprove,
  onReject,
  isApproving,
}: ModerationCardProps) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <MiniPreview
            skinColor={character.skinColor}
            hairColor={character.hairColor}
            eyeColor={character.eyeColor}
            faceShape={character.faceShape}
            hairStyle={character.hairStyle}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-cream-100 font-semibold truncate">
            {character.name}
          </p>

          <div className="flex items-center gap-1.5 mt-1">
            {CLASS_ICONS[character.className] && (
              <span className="w-4 h-4 text-gold-400 flex-shrink-0" aria-hidden="true">
                {CLASS_ICONS[character.className]}
              </span>
            )}
            <span className="text-sm text-cream-400">{character.className}</span>
          </div>

          <p className="text-xs text-cream-500 mt-2 truncate">
            par <span className="text-cream-300">{character.ownerPseudo}</span>
          </p>

          <time
            dateTime={character.submittedAt}
            className="text-xs text-cream-600 mt-1 block"
          >
            {formatRelativeDate(character.submittedAt)}
          </time>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button
          variant="success"
          size="sm"
          onClick={() => onApprove(character.id)}
          isLoading={isApproving}
          aria-label={`Approuver ${character.name}`}
          className="flex-1"
        >
          Approuver
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onReject(character.id)}
          disabled={isApproving}
          aria-label={`Rejeter ${character.name}`}
          className="flex-1"
        >
          Rejeter
        </Button>
      </div>
    </div>
  );
});
