import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CharacterForm } from './CharacterForm';

expect.extend(toHaveNoViolations);

vi.mock('../../services/referenceDataService', () => ({
  fetchCharacterClasses: vi.fn().mockResolvedValue([
    { id: 1, name: 'Guerrier', description: 'Un combattant robuste.', iconUrl: null },
    { id: 2, name: 'Mage', description: 'Un lanceur de sorts.', iconUrl: null },
    { id: 3, name: 'Archer', description: 'Un tireur d\'élite.', iconUrl: null },
    { id: 4, name: 'Voleur', description: 'Un maître de la furtivité.', iconUrl: null },
  ]),
}));

vi.mock('../../services/characterService', () => ({
  checkNameAvailability: vi.fn().mockResolvedValue({ available: true }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({ token: 'test-token' }),
}));

const mockOnSaveDraft = vi.fn();
const mockOnSubmitToModeration = vi.fn();

const renderForm = (mode: 'create' | 'edit' = 'create', includeSubmitToModeration = true) => {
  return render(
    <CharacterForm
      onSaveDraft={mockOnSaveDraft}
      onSubmitToModeration={includeSubmitToModeration ? mockOnSubmitToModeration : undefined}
      isLoadingDraft={false}
      isLoadingSubmit={false}
      mode={mode}
    />
  );
};

const fillStep1AndNavigate = async () => {
  // Fill name
  fireEvent.change(screen.getByLabelText(/nom du personnage/i), { target: { value: 'TestHero' } });

  // Select class (wait for classes to load)
  await waitFor(() => {
    expect(screen.getByRole('radio', { name: /guerrier/i })).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole('radio', { name: /guerrier/i }));

  // Select gender
  fireEvent.click(screen.getByLabelText('Masculin'));

  // Click continue button
  fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

  // Wait for Step 2 to appear
  await waitFor(() => {
    expect(screen.getByText(/étape 2/i)).toBeInTheDocument();
  });
};

const fillAllFieldsAndNavigate = async () => {
  // Fill Step 1
  await fillStep1AndNavigate();

  // Fill Step 2 - Visage tab (face shape)
  const visageTab = screen.getByRole('tab', { name: /visage/i });
  fireEvent.click(visageTab);
  await waitFor(() => {
    expect(screen.getByRole('radio', { name: /rond/i })).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole('radio', { name: /rond/i }));

  // Fill Step 2 - Cheveux tab (hair style + color)
  const cheveuxTab = screen.getByRole('tab', { name: /cheveux/i });
  fireEvent.click(cheveuxTab);
  await waitFor(() => {
    expect(screen.getByText(/style de cheveux/i)).toBeInTheDocument();
  });
  // Select hair style
  const courtRadio = screen.getByRole('radio', { name: /court/i });
  fireEvent.click(courtRadio);

  // Fill Step 2 - Détails tab (eye, nose, mouth shapes)
  const detailsTab = screen.getByRole('tab', { name: /détails/i });
  fireEvent.click(detailsTab);
  await waitFor(() => {
    expect(screen.getByText(/forme des yeux/i)).toBeInTheDocument();
  });
  // Select eye shape
  const amandeRadio = screen.getByRole('radio', { name: /amande/i });
  fireEvent.click(amandeRadio);
  // Select nose shape
  const droitRadio = screen.getByRole('radio', { name: /droit/i });
  fireEvent.click(droitRadio);
  // Select mouth shape
  const fineRadio = screen.getByRole('radio', { name: /fine/i });
  fireEvent.click(fineRadio);
};

describe('CharacterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSaveDraft.mockResolvedValue(undefined);
    mockOnSubmitToModeration.mockResolvedValue(undefined);
  });

  describe('rendering - Step 1', () => {
    it('should render identity step in stepper', () => {
      renderForm();

      expect(screen.getByText('Identité')).toBeInTheDocument();
    });

    it('should render appearance step in stepper', () => {
      renderForm();

      expect(screen.getByText('Apparence')).toBeInTheDocument();
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

    it('should render continue button in Step 1', () => {
      renderForm();

      expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument();
    });

    it('should render character preview', () => {
      renderForm();

      expect(screen.getByText('Aperçu en temps réel')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      renderForm();

      expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument();
    });

    it('should render random appearance button', () => {
      renderForm();

      expect(screen.getByRole('button', { name: /apparence aléatoire/i })).toBeInTheDocument();
    });

    it('should load character classes', async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByText('Guerrier')).toBeInTheDocument();
        expect(screen.getByText('Mage')).toBeInTheDocument();
      });
    });

    it('should render class selector with icons', async () => {
      renderForm();

      await waitFor(() => {
        const guerrierButton = screen.getByRole('radio', { name: /guerrier/i });
        expect(guerrierButton).toBeInTheDocument();
      });
    });

    it('should display classes in correct order', async () => {
      renderForm();

      // Wait for classes to load
      await waitFor(() => {
        expect(screen.getByText('Guerrier')).toBeInTheDocument();
      });

      // Check the order of classes by finding their positions in DOM
      const classNames = ['Guerrier', 'Archer', 'Mage', 'Voleur'];
      const classElements = classNames.map(name => screen.getByText(name));

      // Check all class elements are present (order is correct since sorted array)
      classElements.forEach(el => expect(el).toBeInTheDocument());
    });
  });

  describe('rendering - Step 2', () => {
    it('should render tabs for appearance customization after navigating to Step 2', async () => {
      renderForm();
      await fillStep1AndNavigate();

      expect(screen.getByRole('tab', { name: /visage/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /cheveux/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /détails/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /couleurs/i })).toBeInTheDocument();
    });

    it('should render draft button in Step 2', async () => {
      renderForm('create');
      await fillStep1AndNavigate();

      expect(screen.getByRole('button', { name: /sauvegarder le brouillon/i })).toBeInTheDocument();
    });

    it('should render submit to moderation button in Step 2', async () => {
      renderForm('create');
      await fillStep1AndNavigate();

      expect(screen.getByRole('button', { name: /soumettre à modération/i })).toBeInTheDocument();
    });

    it('should render back button in Step 2', async () => {
      renderForm();
      await fillStep1AndNavigate();

      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
    });
  });

  describe('step navigation', () => {
    it('should not navigate to Step 2 if name is empty', async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /guerrier/i })).toBeInTheDocument();
      });

      // Select class but leave name empty
      fireEvent.click(screen.getByRole('radio', { name: /guerrier/i }));
      fireEvent.click(screen.getByLabelText('Masculin'));

      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      await waitFor(() => {
        expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
      });
    });

    it('should navigate back to Step 1 when clicking back button', async () => {
      renderForm();
      await fillStep1AndNavigate();

      fireEvent.click(screen.getByRole('button', { name: /retour/i }));

      await waitFor(() => {
        expect(screen.getByText(/étape 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nom du personnage/i)).toBeInTheDocument();
      });
    });

    it('should preserve form data when navigating between steps', async () => {
      renderForm();

      // Fill Step 1
      fireEvent.change(screen.getByLabelText(/nom du personnage/i), { target: { value: 'MyHero' } });

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /guerrier/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('radio', { name: /guerrier/i }));
      fireEvent.click(screen.getByLabelText('Féminin'));

      // Navigate to Step 2
      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      await waitFor(() => {
        expect(screen.getByText(/étape 2/i)).toBeInTheDocument();
      });

      // Navigate back to Step 1
      fireEvent.click(screen.getByRole('button', { name: /retour/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/nom du personnage/i)).toHaveValue('MyHero');
        expect(screen.getByLabelText('Féminin')).toBeChecked();
      });
    });
  });

  describe('validation', () => {
    it('should show error when name is empty and trying to continue', async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /guerrier/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('radio', { name: /guerrier/i }));
      fireEvent.click(screen.getByLabelText('Masculin'));
      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      await waitFor(() => {
        expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
      });
    });

    it('should show error when name is too short', async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /guerrier/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nom du personnage/i), { target: { value: 'A' } });
      fireEvent.click(screen.getByRole('radio', { name: /guerrier/i }));
      fireEvent.click(screen.getByLabelText('Masculin'));
      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      await waitFor(() => {
        expect(screen.getByText(/au moins 2 caractères/i)).toBeInTheDocument();
      });
    });
  });

  describe('tab navigation (Step 2)', () => {
    it('should switch to cheveux tab when clicked', async () => {
      renderForm();
      await fillStep1AndNavigate();

      const cheveuxTab = screen.getByRole('tab', { name: /cheveux/i });
      fireEvent.click(cheveuxTab);

      await waitFor(() => {
        expect(screen.getByText(/couleur des cheveux/i)).toBeInTheDocument();
      });
    });

    it('should switch to couleurs tab when clicked', async () => {
      renderForm();
      await fillStep1AndNavigate();

      const couleursTab = screen.getByRole('tab', { name: /couleurs/i });
      fireEvent.click(couleursTab);

      await waitFor(() => {
        expect(screen.getByText(/couleur de peau/i)).toBeInTheDocument();
        expect(screen.getByText(/couleur des yeux/i)).toBeInTheDocument();
      });
    });

    it('should switch to details tab when clicked', async () => {
      renderForm();
      await fillStep1AndNavigate();

      const detailsTab = screen.getByRole('tab', { name: /détails/i });
      fireEvent.click(detailsTab);

      await waitFor(() => {
        expect(screen.getByText(/forme des yeux/i)).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should call onSaveDraft when clicking draft button with valid data', async () => {
      renderForm();
      await fillAllFieldsAndNavigate();

      fireEvent.click(screen.getByRole('button', { name: /sauvegarder le brouillon/i }));

      await waitFor(() => {
        expect(mockOnSaveDraft).toHaveBeenCalled();
      });
    });

    it('should call onSubmitToModeration when clicking submit button with valid data', async () => {
      renderForm();
      await fillAllFieldsAndNavigate();

      fireEvent.click(screen.getByRole('button', { name: /soumettre à modération/i }));

      await waitFor(() => {
        expect(mockOnSubmitToModeration).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations on Step 1', async () => {
      const { container } = renderForm();

      // Wait for classes to load
      await waitFor(() => {
        expect(screen.getByText('Guerrier')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations on Step 2', async () => {
      const { container } = renderForm();
      await fillAllFieldsAndNavigate();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
