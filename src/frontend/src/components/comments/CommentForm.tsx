import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createComment } from '../../services/commentService';
import type { ApiError } from '../../services/api';
import { StarRating } from '../ui';
import { Button } from '../ui';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

interface CommentFormProps {
  characterId: number;
  isOwner: boolean;
  hasAlreadyCommented: boolean;
  onSuccess: () => void;
}

export function CommentForm({ characterId, isOwner, hasAlreadyCommented, onSuccess }: CommentFormProps) {
  const { isAuthenticated, token } = useAuth();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 text-center">
        <p className="text-cream-400 mb-3">
          Connectez-vous pour donner votre avis.
        </p>
        <Link
          to="/login"
          className="text-gold-500 hover:text-gold-400 font-medium underline hover:no-underline"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 text-center">
        <p className="text-cream-500">
          Vous ne pouvez pas commenter votre propre personnage.
        </p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-dark-800 border border-success-500/30 rounded-xl p-5 text-center">
        <svg className="w-10 h-10 mx-auto text-success-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-cream-200 font-medium mb-1">
          Merci pour votre avis !
        </p>
        <p className="text-cream-500 text-sm">
          Il sera visible après validation par un modérateur.
        </p>
      </div>
    );
  }

  if (hasAlreadyCommented) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 text-center">
        <p className="text-cream-500">
          Vous avez déjà donné votre avis sur ce personnage.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (rating === 0) {
      setRatingError('Veuillez sélectionner une note.');
      hasError = true;
    } else {
      setRatingError(null);
    }

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < MIN_LENGTH) {
      setTextError(`Le commentaire doit contenir au moins ${MIN_LENGTH} caractères.`);
      hasError = true;
    } else {
      setTextError(null);
    }

    if (hasError) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await createComment(characterId, { rating, text: trimmed }, token!);
      setIsSubmitted(true);
      onSuccess();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      if (apiError?.status === 409) {
        setSubmitError('Vous avez déjà donné votre avis sur ce personnage.');
      } else {
        setSubmitError("Erreur lors de l'envoi de votre avis.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
      <h3 className="text-lg font-medium text-cream-100 mb-4">Donner votre avis</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-cream-300 mb-2">Note</label>
        <StarRating
          value={rating}
          onChange={(val) => {
            setRating(val);
            if (ratingError) setRatingError(null);
          }}
        />
        {ratingError && (
          <p className="text-sm text-error-500 mt-1" role="alert">{ratingError}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="comment-text" className="block text-sm font-medium text-cream-300 mb-2">
          Commentaire
        </label>
        <textarea
          id="comment-text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (textError) setTextError(null);
          }}
          maxLength={MAX_LENGTH}
          rows={4}
          placeholder="Partagez votre avis sur ce personnage..."
          className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 placeholder-cream-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-vertical"
          aria-describedby={textError ? 'comment-text-error' : undefined}
          aria-invalid={textError ? 'true' : undefined}
        />
        <div className="flex justify-between items-center mt-1">
          {textError ? (
            <p id="comment-text-error" className="text-sm text-error-500" role="alert">{textError}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-cream-600">
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-error-500 mb-4" role="alert">{submitError}</p>
      )}

      <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
        Envoyer mon avis
      </Button>
    </form>
  );
}
