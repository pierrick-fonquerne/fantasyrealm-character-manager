import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CharacterCard } from './CharacterCard';
import type { CharacterSummary } from '../../services/characterService';

expect.extend(toHaveNoViolations);

const mockCharacter: CharacterSummary = {
  id: 1,
  name: 'Arthas',
  className: 'Guerrier',
  status: 'Draft',
  gender: 'Male',
  isShared: false,
  skinColor: '#C19A6B',
  hairColor: '#4A3C31',
  eyeColor: '#4A3C31',
  faceShape: 'ovale',
  hairStyle: 'court',
  eyeShape: 'amande',
  noseShape: 'droit',
  mouthShape: 'moyenne',
};

const approvedCharacter: CharacterSummary = {
  ...mockCharacter,
  status: 'Approved',
};

const renderCard = (
  character: CharacterSummary = mockCharacter,
  props: Partial<React.ComponentProps<typeof CharacterCard>> = {}
) => {
  return render(
    <MemoryRouter>
      <CharacterCard character={character} {...props} />
    </MemoryRouter>
  );
};

describe('CharacterCard', () => {
  describe('rendering', () => {
    it('should render character name', () => {
      renderCard();
      expect(screen.getByText('Arthas')).toBeInTheDocument();
    });

    it('should render class and gender', () => {
      renderCard();
      expect(screen.getByText(/Guerrier/)).toBeInTheDocument();
      expect(screen.getByText(/Masculin/)).toBeInTheDocument();
    });

    it('should render female gender correctly', () => {
      renderCard({ ...mockCharacter, gender: 'Female' });
      expect(screen.getByText(/Féminin/)).toBeInTheDocument();
    });

    it('should render status badge for Draft', () => {
      renderCard();
      expect(screen.getByText('Brouillon')).toBeInTheDocument();
    });

    it('should render status badge for Approved', () => {
      renderCard(approvedCharacter);
      expect(screen.getByText('Approuvé')).toBeInTheDocument();
    });

    it('should render status badge for Pending', () => {
      renderCard({ ...mockCharacter, status: 'Pending' });
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('should render status badge for Rejected', () => {
      renderCard({ ...mockCharacter, status: 'Rejected' });
      expect(screen.getByText('Rejeté')).toBeInTheDocument();
    });

    it('should render link to character details', () => {
      renderCard();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/characters/1');
    });

    it('should show shared indicator for approved shared character', () => {
      renderCard({ ...approvedCharacter, isShared: true });
      expect(screen.getByText('Partagé')).toBeInTheDocument();
    });

    it('should show private indicator for approved non-shared character', () => {
      renderCard({ ...approvedCharacter, isShared: false });
      expect(screen.getByText('Privé')).toBeInTheDocument();
    });

    it('should not show shared indicator for non-approved character', () => {
      renderCard({ ...mockCharacter, isShared: true });
      expect(screen.queryByText('Partagé')).not.toBeInTheDocument();
      expect(screen.queryByText('Privé')).not.toBeInTheDocument();
    });
  });

  describe('actions visibility by status', () => {
    it('should show Edit button for Draft status', () => {
      const onEdit = vi.fn();
      renderCard(mockCharacter, { onEdit });
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    it('should show Edit button for Rejected status', () => {
      const onEdit = vi.fn();
      renderCard({ ...mockCharacter, status: 'Rejected' }, { onEdit });
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    it('should show Edit button for Approved status', () => {
      const onEdit = vi.fn();
      renderCard(approvedCharacter, { onEdit });
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    it('should not show Edit button for Pending status', () => {
      const onEdit = vi.fn();
      renderCard({ ...mockCharacter, status: 'Pending' }, { onEdit });
      expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
    });

    it('should show Duplicate button only for Approved status', () => {
      const onDuplicate = vi.fn();
      renderCard(approvedCharacter, { onDuplicate });
      expect(screen.getByText('Dupliquer')).toBeInTheDocument();
    });

    it('should not show Duplicate button for Draft status', () => {
      const onDuplicate = vi.fn();
      renderCard(mockCharacter, { onDuplicate });
      expect(screen.queryByText('Dupliquer')).not.toBeInTheDocument();
    });

    it('should show Share button only for Approved status', () => {
      const onToggleShare = vi.fn();
      renderCard({ ...approvedCharacter, isShared: false }, { onToggleShare });
      expect(screen.getByText('Partager')).toBeInTheDocument();
    });

    it('should show Unshare button for shared approved character', () => {
      const onToggleShare = vi.fn();
      renderCard({ ...approvedCharacter, isShared: true }, { onToggleShare });
      expect(screen.getByText('Rendre privé')).toBeInTheDocument();
    });

    it('should always show Delete button when onDelete provided', () => {
      const onDelete = vi.fn();
      renderCard(mockCharacter, { onDelete });
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });
  });

  describe('action callbacks', () => {
    it('should call onEdit with character id', () => {
      const onEdit = vi.fn();
      renderCard(mockCharacter, { onEdit });
      fireEvent.click(screen.getByText('Modifier'));
      expect(onEdit).toHaveBeenCalledWith(1);
    });

    it('should call onDuplicate when clicked', () => {
      const onDuplicate = vi.fn();
      renderCard(approvedCharacter, { onDuplicate });
      fireEvent.click(screen.getByText('Dupliquer'));
      expect(onDuplicate).toHaveBeenCalled();
    });

    it('should call onToggleShare with character id', () => {
      const onToggleShare = vi.fn();
      renderCard({ ...approvedCharacter, isShared: false }, { onToggleShare });
      fireEvent.click(screen.getByText('Partager'));
      expect(onToggleShare).toHaveBeenCalledWith(1);
    });

    it('should call onDelete when clicked', () => {
      const onDelete = vi.fn();
      renderCard(mockCharacter, { onDelete });
      fireEvent.click(screen.getByText('Supprimer'));
      expect(onDelete).toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should show loading state for duplicate', () => {
      const onDuplicate = vi.fn();
      renderCard(approvedCharacter, { onDuplicate, isDuplicating: true });
      expect(screen.getByText('Duplication...')).toBeInTheDocument();
    });

    it('should show loading state for toggle share', () => {
      const onToggleShare = vi.fn();
      renderCard(approvedCharacter, { onToggleShare, isTogglingShare: true });
      expect(screen.getByText('En cours...')).toBeInTheDocument();
    });

    it('should show loading state for delete', () => {
      const onDelete = vi.fn();
      renderCard(mockCharacter, { onDelete, isDeleting: true });
      expect(screen.getByText('Suppression...')).toBeInTheDocument();
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderCard(approvedCharacter, {
        onEdit: vi.fn(),
        onDuplicate: vi.fn(),
        onDelete: vi.fn(),
        onToggleShare: vi.fn(),
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible button labels', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      renderCard(mockCharacter, { onEdit, onDelete });

      const editButton = screen.getByLabelText(/modifier arthas/i);
      const deleteButton = screen.getByLabelText(/supprimer arthas/i);
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    it('should have character preview with aria-label', () => {
      renderCard(mockCharacter);
      expect(screen.getByRole('img', { name: /aperçu du personnage/i })).toBeInTheDocument();
    });
  });
});
