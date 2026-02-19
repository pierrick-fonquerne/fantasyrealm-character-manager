import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal/Modal';
import { useAuth } from '../../context/AuthContext';
import { accountService } from '../../services/accountService';
import type { ApiError } from '../../services/api';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await accountService.deleteAccount({ password }, token!);
      logout();
      navigate('/', { state: { accountDeleted: true } });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Une erreur est survenue lors de la suppression.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" closeOnOverlay={false}>
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={handleClose}>
          Supprimer mon compte
        </ModalHeader>

        <ModalBody>
          <div
            className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            role="alert"
          >
            <p className="text-red-400 text-sm font-medium mb-2">
              Cette action est irréversible.
            </p>
            <p className="text-red-400/80 text-sm">
              Toutes vos données seront définitivement supprimées : personnages,
              commentaires et informations de compte. Un email de confirmation
              vous sera envoyé.
            </p>
          </div>

          {error && (
            <div
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="delete-account-password"
              className="block text-sm font-medium text-cream-300 mb-1.5"
            >
              Confirmez votre mot de passe
            </label>
            <input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-cream-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Votre mot de passe actuel"
              required
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 text-sm font-medium text-cream-300 hover:text-cream-100 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!password || isSubmitting}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-900 cursor-pointer"
          >
            {isSubmitting ? 'Suppression en cours...' : 'Supprimer définitivement'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export { DeleteAccountModal };
