import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../ui';

interface ResetPasswordModalProps {
  isOpen: boolean;
  targetName: string;
  onConfirm: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  result: 'idle' | 'success' | 'error';
}

export function ResetPasswordModal({
  isOpen,
  targetName,
  onConfirm,
  onClose,
  isSubmitting,
  result,
}: ResetPasswordModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>
        Réinitialiser le mot de passe
      </ModalHeader>
      <ModalBody>
        {result === 'idle' && (
          <p className="text-cream-300">
            Réinitialiser le mot de passe de{' '}
            <strong className="text-cream-100">{targetName}</strong> ?
            <br />
            <span className="text-cream-500 text-sm mt-2 block">
              Un mot de passe temporaire sera généré et envoyé par email.
              L'employé devra le modifier à sa prochaine connexion.
            </span>
          </p>
        )}
        {result === 'success' && (
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-success-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-cream-300">
              Le mot de passe de <strong className="text-cream-100">{targetName}</strong> a
              été réinitialisé avec succès. Un email contenant le mot de passe temporaire
              lui a été envoyé.
            </p>
          </div>
        )}
        {result === 'error' && (
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-error-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-cream-300">
              Une erreur est survenue lors de la réinitialisation du mot de passe.
              Veuillez réessayer.
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {result === 'idle' && (
          <>
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={onConfirm} isLoading={isSubmitting}>
              <svg className="w-3.5 h-3.5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Réinitialiser
            </Button>
          </>
        )}
        {(result === 'success' || result === 'error') && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
