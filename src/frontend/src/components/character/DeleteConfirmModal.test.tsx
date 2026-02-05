import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DeleteConfirmModal } from './DeleteConfirmModal';

expect.extend(toHaveNoViolations);

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    characterName: 'Arthas',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isDeleting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('should render modal when open', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display character name', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByText('Arthas')).toBeInTheDocument();
    });

    it('should display title', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByText('Supprimer le personnage')).toBeInTheDocument();
    });

    it('should display warning message', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByText(/cette action est irréversible/i)).toBeInTheDocument();
    });

    it('should display confirmation message with character name', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByText(/voulez-vous vraiment supprimer/i)).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();
      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /annuler/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when delete button clicked', () => {
      const onConfirm = vi.fn();
      render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when clicking backdrop', () => {
      const onCancel = vi.fn();
      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      const backdrop = screen.getByRole('dialog').querySelector('[aria-hidden="true"]');
      fireEvent.click(backdrop!);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when pressing Escape', () => {
      const onCancel = vi.fn();
      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel on Escape when closed', () => {
      const onCancel = vi.fn();
      render(<DeleteConfirmModal {...defaultProps} isOpen={false} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading text when deleting', () => {
      render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);
      // Button uses isLoading which shows "Chargement..."
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('should disable cancel button when deleting', () => {
      render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);
      expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled();
    });

    it('should disable delete button when deleting', () => {
      render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);
      const deleteButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.includes('Chargement')
      );
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('body scroll lock', () => {
    it('should lock body scroll when open', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when closed', () => {
      const { rerender } = render(<DeleteConfirmModal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<DeleteConfirmModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('should unlock body scroll on unmount', () => {
      const { unmount } = render(<DeleteConfirmModal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<DeleteConfirmModal {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper dialog role', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible title', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-modal-title');
      expect(screen.getByText('Supprimer le personnage')).toHaveAttribute('id', 'delete-modal-title');
    });

    it('should focus cancel button when opened', () => {
      render(<DeleteConfirmModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /annuler/i })).toHaveFocus();
    });
  });
});
