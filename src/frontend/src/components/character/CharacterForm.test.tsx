import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CharacterForm } from './CharacterForm';

expect.extend(toHaveNoViolations);

vi.mock('../../services/referenceDataService', () => ({
  fetchCharacterClasses: vi.fn().mockResolvedValue([
    { id: 1, name: 'Guerrier', description: 'Un combattant robuste.', iconUrl: null },
    { id: 2, name: 'Mage', description: 'Un lanceur de sorts.', iconUrl: null },
  ]),
}));

const mockOnSubmit = vi.fn();

const renderForm = (mode: 'create' | 'edit' = 'create') => {
  return render(
    <CharacterForm onSubmit={mockOnSubmit} isLoading={false} mode={mode} />
  );
};

describe('CharacterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('should render all fieldsets', () => {
      renderForm();

      expect(screen.getByText('Identité')).toBeInTheDocument();
      expect(screen.getByText('Couleurs')).toBeInTheDocument();
      expect(screen.getByText('Morphologie')).toBeInTheDocument();
    });

    it('should render name input', () => {
      renderForm();

      expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
    });

    it('should render gender radio buttons', () => {
      renderForm();

      expect(screen.getByLabelText('Masculin')).toBeInTheDocument();
      expect(screen.getByLabelText('Féminin')).toBeInTheDocument();
    });

    it('should render color pickers', () => {
      renderForm();

      expect(document.getElementById('skinColor')).toBeInTheDocument();
      expect(document.getElementById('eyeColor')).toBeInTheDocument();
      expect(document.getElementById('hairColor')).toBeInTheDocument();
    });

    it('should render create button in create mode', () => {
      renderForm('create');

      expect(screen.getByRole('button', { name: /créer le personnage/i })).toBeInTheDocument();
    });

    it('should render save button in edit mode', () => {
      renderForm('edit');

      expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument();
    });

    it('should load character classes', async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByText('Guerrier')).toBeInTheDocument();
        expect(screen.getByText('Mage')).toBeInTheDocument();
      });
    });
  });

  describe('validation', () => {
    it('should show error when name is empty', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /créer le personnage/i }));

      await waitFor(() => {
        expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
      });
    });

    it('should show error when name is too short', async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/nom du personnage/i), { target: { value: 'A' } });
      fireEvent.click(screen.getByRole('button', { name: /créer le personnage/i }));

      await waitFor(() => {
        expect(screen.getByText(/au moins 2 caractères/i)).toBeInTheDocument();
      });
    });

    it('should show errors for all required fields', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /créer le personnage/i }));

      await waitFor(() => {
        expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
        expect(screen.getByText(/la classe est requise/i)).toBeInTheDocument();
        expect(screen.getByText(/le genre est requis/i)).toBeInTheDocument();
      });
    });

    it('should not call onSubmit when validation fails', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /créer le personnage/i }));

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderForm();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
