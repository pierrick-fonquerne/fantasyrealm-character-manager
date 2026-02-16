import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DuplicateModal } from './DuplicateModal';
import * as characterService from '../../services/characterService';

expect.extend(toHaveNoViolations);

vi.mock('../../services/characterService', () => ({
  checkNameAvailability: vi.fn(),
}));

describe('DuplicateModal', () => {
  const defaultProps = {
    isOpen: true,
    characterName: 'Arthas',
    token: 'test-token',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isDuplicating: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(characterService.checkNameAvailability).mockResolvedValue({
      available: true,
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('should render modal when open', () => {
      render(<DuplicateModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Dupliquer le personnage')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<DuplicateModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show character name being duplicated', () => {
      render(<DuplicateModal {...defaultProps} />);
      expect(screen.getByText('Arthas')).toBeInTheDocument();
    });

    it('should initialize input with default name', () => {
      render(<DuplicateModal {...defaultProps} />);
      const input = screen.getByLabelText('Nom du nouveau personnage');
      expect(input).toHaveValue('Arthas (copie)');
    });

    it('should have proper aria attributes', () => {
      render(<DuplicateModal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'duplicate-modal-title');
    });
  });

  describe('name validation', () => {
    it('should show error for empty name on submit', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<DuplicateModal {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByLabelText('Nom du nouveau personnage');
      await user.clear(input);

      // Submit button should be disabled when name is empty
      const submitButton = screen.getByRole('button', { name: /dupliquer/i });
      expect(submitButton).toBeDisabled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should disable submit for name too short', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<DuplicateModal {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByLabelText('Nom du nouveau personnage');
      await user.clear(input);
      await user.type(input, 'A');

      // Submit button should be disabled when name is too short
      const submitButton = screen.getByRole('button', { name: /dupliquer/i });
      expect(submitButton).toBeDisabled();
    });

    it('should check name availability after typing valid name', async () => {
      const user = userEvent.setup();
      render(<DuplicateModal {...defaultProps} />);

      const input = screen.getByLabelText('Nom du nouveau personnage');
      await user.clear(input);
      await user.type(input, 'NewName');

      await waitFor(() => {
        expect(characterService.checkNameAvailability).toHaveBeenCalled();
        const lastCall = vi.mocked(characterService.checkNameAvailability).mock.calls.at(-1);
        expect(lastCall?.[0]).toContain('NewName');
        expect(lastCall?.[1]).toBe('test-token');
      }, { timeout: 3000 });
    });

    it('should show available message when name is available', async () => {
      const user = userEvent.setup();
      vi.mocked(characterService.checkNameAvailability).mockResolvedValue({
        available: true,
      });

      render(<DuplicateModal {...defaultProps} />);

      const input = screen.getByLabelText('Nom du nouveau personnage');
      await user.clear(input);
      await user.type(input, 'NewName');

      await waitFor(() => {
        expect(screen.getByText('Ce nom est disponible')).toBeInTheDocument();
      });
    });

    it('should show error when name is taken', async () => {
      const user = userEvent.setup();
      vi.mocked(characterService.checkNameAvailability).mockResolvedValue({
        available: false,
      });

      render(<DuplicateModal {...defaultProps} />);

      const input = screen.getByLabelText('Nom du nouveau personnage');
      await user.clear(input);
      await user.type(input, 'TakenName');

      await waitFor(() => {
        expect(screen.getByText('Ce nom est déjà pris')).toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('should call onConfirm with trimmed name when valid', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<DuplicateModal {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByLabelText('Nom du nouveau personnage');
      await user.clear(input);
      await user.type(input, '  NewCharacter  ');

      // Wait for debounce + availability check to complete
      await waitFor(() => {
        expect(screen.getByText('Ce nom est disponible')).toBeInTheDocument();
      }, { timeout: 3000 });

      await user.click(screen.getByText('Dupliquer'));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith('NewCharacter');
      });
    });

    it('should call onCancel when clicking cancel button', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(<DuplicateModal {...defaultProps} onCancel={onCancel} />);
      await user.click(screen.getByText('Annuler'));

      expect(onCancel).toHaveBeenCalled();
    });

    it('should call onCancel when clicking backdrop', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(<DuplicateModal {...defaultProps} onCancel={onCancel} />);
      const backdrop = document.querySelector('[aria-hidden="true"]')!;
      await user.click(backdrop);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should call onCancel when pressing Escape', () => {
      const onCancel = vi.fn();
      render(<DuplicateModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
    });

    it('should not call onConfirm when name is taken', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      vi.mocked(characterService.checkNameAvailability).mockResolvedValue({
        available: false,
      });

      render(<DuplicateModal {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByLabelText('Nom du nouveau personnage');
      await user.clear(input);
      await user.type(input, 'TakenName');

      await waitFor(() => {
        expect(screen.getByText('Ce nom est déjà pris')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Dupliquer'));

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading text when duplicating', () => {
      render(<DuplicateModal {...defaultProps} isDuplicating={true} />);
      // Button shows "Chargement..." when isLoading is true
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('should disable input when duplicating', () => {
      render(<DuplicateModal {...defaultProps} isDuplicating={true} />);
      const input = screen.getByLabelText('Nom du nouveau personnage');
      expect(input).toBeDisabled();
    });

    it('should disable buttons when duplicating', () => {
      render(<DuplicateModal {...defaultProps} isDuplicating={true} />);
      expect(screen.getByText('Annuler').closest('button')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<DuplicateModal {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should focus input when modal opens', async () => {
      render(<DuplicateModal {...defaultProps} />);

      await waitFor(() => {
        const input = screen.getByLabelText('Nom du nouveau personnage');
        expect(document.activeElement).toBe(input);
      });
    });

    it('should prevent body scroll when open', () => {
      render(<DuplicateModal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(<DuplicateModal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<DuplicateModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });
});
