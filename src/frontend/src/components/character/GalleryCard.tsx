import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { GalleryCharacter } from '../../types';
import { MiniPreview } from './MiniPreview';
import { CLASS_ICONS } from '../ui/icons';
import { formatRelativeDate } from '../../utils/formatRelativeDate';

interface GalleryCardProps {
  character: GalleryCharacter;
}

export const GalleryCard = memo(function GalleryCard({ character }: GalleryCardProps) {
  return (
    <Link
      to={`/characters/${character.id}`}
      className="group block bg-dark-800 border border-dark-700 rounded-xl p-4 transition-all duration-200 hover:border-gold-500/50 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      aria-label={`Voir ${character.name} par ${character.authorPseudo}`}
    >
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
          <p className="text-cream-100 font-semibold truncate group-hover:text-gold-300 transition-colors">
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
            par <span className="text-cream-300">{character.authorPseudo}</span>
          </p>

          <time
            dateTime={character.createdAt}
            className="text-xs text-cream-600 mt-1 block"
          >
            {formatRelativeDate(character.createdAt)}
          </time>
        </div>
      </div>
    </Link>
  );
});
