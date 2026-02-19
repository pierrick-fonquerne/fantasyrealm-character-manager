import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../ui';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  targetName: string;
  onConfirm: () => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  targetName,
  onConfirm,
  onClose,
  isSubmitting,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>
        Supprimer {targetName}
      </ModalHeader>
      <ModalBody>
        <p className="text-cream-300">
          Cette action est <strong className="text-error-400">irréversible</strong>.
          Le compte, ses personnages et ses commentaires seront définitivement supprimés.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isSubmitting}>
          Supprimer définitivement
        </Button>
      </ModalFooter>
    </Modal>
  );
}
