import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import {
  Input,
  RadioGroup,
  Button,
  Alert,
  Tabs,
  TabsList,
  Tab,
  TabsPanel,
  ColorSwatchPicker,
  ShapeSelector,
  ClassSelector,
  NameAvailabilityIndicator,
  FormStepper,
} from '../ui';
import { fetchCharacterClasses, type CharacterClass } from '../../services/referenceDataService';
import type { CreateCharacterData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNameAvailability, validateCharacterName } from '../../hooks';
import {
  SKIN_COLORS,
  HAIR_COLORS,
  EYE_COLORS,
  GENDER_OPTIONS,
  CLASS_ORDER,
  FORM_STEPS,
  DEFAULT_CHARACTER_DATA,
  NAME_ERRORS,
  FORM_ERRORS,
  NAME_MIN_LENGTH,
  randomFrom,
} from '../../constants';
import {
  FACE_SHAPE_OPTIONS,
  HAIR_STYLE_OPTIONS,
  EYE_SHAPE_OPTIONS,
  NOSE_SHAPE_OPTIONS,
  MOUTH_SHAPE_OPTIONS,
} from '../../constants/shapeOptions';
import { CharacterPreview } from './CharacterPreview';

// Icons
const DiceIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z" />
  </svg>
);

// Sub-components props
interface IdentityStepProps {
  formData: CreateCharacterData;
  errors: Record<string, string>;
  classes: CharacterClass[];
  classLoadError: string | null;
  isCheckingName: boolean;
  nameAvailable: boolean | null;
  showNameAvailability: boolean;
  characterStatus?: string;
  onFieldChange: <K extends keyof CreateCharacterData>(field: K, value: CreateCharacterData[K]) => void;
  onNext: () => void;
}

interface AppearanceStepProps {
  formData: CreateCharacterData;
  errors: Record<string, string>;
  isLoading: boolean;
  isLoadingDraft: boolean;
  isLoadingSubmit: boolean;
  mode: 'create' | 'edit';
  showSubmitToModeration: boolean;
  onFieldChange: <K extends keyof CreateCharacterData>(field: K, value: CreateCharacterData[K]) => void;
  onPrevious: () => void;
  onSaveDraft: () => void;
  onSubmitToModeration: () => void;
}

// Identity Step Component
const IdentityStep = ({
  formData,
  errors,
  classes,
  classLoadError,
  isCheckingName,
  nameAvailable,
  showNameAvailability,
  characterStatus,
  onFieldChange,
  onNext,
}: IdentityStepProps) => (
  <div className="bg-gradient-to-b from-dark-900 to-dark-800 border border-dark-700 rounded-xl p-6">
    <h2 className="font-display text-xl text-gold-400 mb-6 pb-3 border-b border-dark-700">
      Étape 1 : Identité
    </h2>
    <div className="space-y-5">
      {characterStatus === 'Approved' && (
        <Alert variant="warning" className="text-sm">
          Modifier le nom d'un personnage approuvé le resoumettra automatiquement à la modération.
        </Alert>
      )}
      <div>
        <Input
          label="Nom du personnage"
          placeholder="Ex: Arthas, Legolas..."
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          error={
            errors.name && errors.name !== NAME_ERRORS.ALREADY_TAKEN
              ? errors.name
              : undefined
          }
          required
        />
        {showNameAvailability && (
          <NameAvailabilityIndicator
            isChecking={isCheckingName}
            isAvailable={nameAvailable}
          />
        )}
      </div>

      {classLoadError && (
        <Alert variant="warning" className="text-sm">
          {classLoadError}
        </Alert>
      )}

      <ClassSelector
        label="Classe"
        value={formData.classId}
        onChange={(classId) => onFieldChange('classId', classId)}
        classes={classes}
        error={errors.classId}
      />

      <RadioGroup
        label="Genre"
        name="gender"
        options={GENDER_OPTIONS}
        value={formData.gender}
        onChange={(value) => onFieldChange('gender', value)}
        error={errors.gender}
      />
    </div>

    <div className="flex justify-end mt-8 pt-6 border-t border-dark-700">
      <Button type="button" variant="primary" onClick={onNext} className="px-8">
        Continuer →
      </Button>
    </div>
  </div>
);

// Appearance Step Component
const AppearanceStep = ({
  formData,
  errors,
  isLoading,
  isLoadingDraft,
  isLoadingSubmit,
  mode,
  showSubmitToModeration,
  onFieldChange,
  onPrevious,
  onSaveDraft,
  onSubmitToModeration,
}: AppearanceStepProps) => (
  <div className="bg-gradient-to-b from-dark-900 to-dark-800 border border-dark-700 rounded-xl p-6">
    <h2 className="font-display text-xl text-gold-400 mb-6 pb-3 border-b border-dark-700">
      Étape 2 : Apparence
    </h2>

    <Tabs defaultTab="visage">
      <TabsList className="mb-6">
        <Tab value="visage">Visage</Tab>
        <Tab value="cheveux">Cheveux</Tab>
        <Tab value="details">Détails</Tab>
        <Tab value="couleurs">Couleurs</Tab>
      </TabsList>

      <TabsPanel value="visage">
        <ShapeSelector
          label="Forme du visage"
          value={formData.faceShape}
          onChange={(value) => onFieldChange('faceShape', value)}
          options={FACE_SHAPE_OPTIONS}
          error={errors.faceShape}
          columns={4}
        />
      </TabsPanel>

      <TabsPanel value="cheveux">
        <div className="space-y-6">
          <ShapeSelector
            label="Style de cheveux"
            value={formData.hairStyle}
            onChange={(value) => onFieldChange('hairStyle', value)}
            options={HAIR_STYLE_OPTIONS}
            error={errors.hairStyle}
            columns={4}
          />
          <ColorSwatchPicker
            label="Couleur des cheveux"
            value={formData.hairColor}
            onChange={(color) => onFieldChange('hairColor', color)}
            colors={HAIR_COLORS}
          />
        </div>
      </TabsPanel>

      <TabsPanel value="details">
        <div className="space-y-6">
          <ShapeSelector
            label="Forme des yeux"
            value={formData.eyeShape}
            onChange={(value) => onFieldChange('eyeShape', value)}
            options={EYE_SHAPE_OPTIONS}
            error={errors.eyeShape}
            columns={3}
          />
          <ShapeSelector
            label="Forme du nez"
            value={formData.noseShape}
            onChange={(value) => onFieldChange('noseShape', value)}
            options={NOSE_SHAPE_OPTIONS}
            error={errors.noseShape}
            columns={5}
          />
          <ShapeSelector
            label="Forme de la bouche"
            value={formData.mouthShape}
            onChange={(value) => onFieldChange('mouthShape', value)}
            options={MOUTH_SHAPE_OPTIONS}
            error={errors.mouthShape}
            columns={3}
          />
        </div>
      </TabsPanel>

      <TabsPanel value="couleurs">
        <div className="space-y-6">
          <ColorSwatchPicker
            label="Couleur de peau"
            value={formData.skinColor}
            onChange={(color) => onFieldChange('skinColor', color)}
            colors={SKIN_COLORS}
          />
          <ColorSwatchPicker
            label="Couleur des yeux"
            value={formData.eyeColor}
            onChange={(color) => onFieldChange('eyeColor', color)}
            colors={EYE_COLORS}
          />
        </div>
      </TabsPanel>
    </Tabs>

    <div className="flex justify-between mt-8 pt-6 border-t border-dark-700">
      <Button type="button" variant="ghost" onClick={onPrevious} className="px-6">
        ← Retour
      </Button>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onSaveDraft}
          isLoading={isLoadingDraft}
          disabled={isLoading}
        >
          {mode === 'create' ? 'Sauvegarder le brouillon' : 'Sauvegarder'}
        </Button>
        {showSubmitToModeration && (
          <Button
            type="button"
            variant="primary"
            onClick={onSubmitToModeration}
            isLoading={isLoadingSubmit}
            disabled={isLoading}
          >
            Soumettre à modération
          </Button>
        )}
      </div>
    </div>
  </div>
);

// Main Component Props
interface CharacterFormProps {
  initialData?: CreateCharacterData;
  characterId?: number;
  characterStatus?: string;
  onSaveDraft: (data: CreateCharacterData) => Promise<void>;
  onSubmitToModeration?: (data: CreateCharacterData) => Promise<void>;
  isLoadingDraft: boolean;
  isLoadingSubmit: boolean;
  mode: 'create' | 'edit';
}

const CharacterForm = ({
  initialData,
  characterId,
  characterStatus,
  onSaveDraft,
  onSubmitToModeration,
  isLoadingDraft,
  isLoadingSubmit,
  mode,
}: CharacterFormProps) => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<CharacterClass[]>([]);
  const [classLoadError, setClassLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCharacterData>(
    initialData ?? { ...DEFAULT_CHARACTER_DATA }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    isChecking: isCheckingName,
    isAvailable: nameAvailable,
    checkAvailability: checkNameAvailability,
    reset: resetNameCheck,
  } = useNameAvailability({ token, excludeId: characterId });

  const isLoading = isLoadingDraft || isLoadingSubmit;

  // Load character classes
  useEffect(() => {
    fetchCharacterClasses()
      .then((fetchedClasses) => {
        const sorted = [...fetchedClasses].sort((a, b) => {
          const indexA = CLASS_ORDER.indexOf(a.name as typeof CLASS_ORDER[number]);
          const indexB = CLASS_ORDER.indexOf(b.name as typeof CLASS_ORDER[number]);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setClasses(sorted);
        setClassLoadError(null);
      })
      .catch(() => {
        setClassLoadError('Impossible de charger les classes. Veuillez rafraîchir la page.');
      });
  }, []);

  const selectedClassName = useMemo(
    () => classes.find((c) => c.id === formData.classId)?.name || '',
    [classes, formData.classId]
  );

  // Pure validation checks (no state updates)
  const isStep1Valid = useMemo((): boolean => {
    const nameError = validateCharacterName(formData.name);
    if (nameError) return false;
    if (nameAvailable === false) return false;
    if (!formData.classId) return false;
    if (!formData.gender) return false;
    return true;
  }, [formData.name, formData.classId, formData.gender, nameAvailable]);

  // Validation functions that update errors (for form submission)
  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateCharacterName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    } else if (nameAvailable === false) {
      newErrors.name = NAME_ERRORS.ALREADY_TAKEN;
    }

    if (!formData.classId) {
      newErrors.classId = FORM_ERRORS.CLASS_REQUIRED;
    }

    if (!formData.gender) {
      newErrors.gender = FORM_ERRORS.GENDER_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, formData.classId, formData.gender, nameAvailable]);

  const validateStep2 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.faceShape) newErrors.faceShape = FORM_ERRORS.FACE_SHAPE_REQUIRED;
    if (!formData.hairStyle) newErrors.hairStyle = FORM_ERRORS.HAIR_STYLE_REQUIRED;
    if (!formData.eyeShape) newErrors.eyeShape = FORM_ERRORS.EYE_SHAPE_REQUIRED;
    if (!formData.noseShape) newErrors.noseShape = FORM_ERRORS.NOSE_SHAPE_REQUIRED;
    if (!formData.mouthShape) newErrors.mouthShape = FORM_ERRORS.MOUTH_SHAPE_REQUIRED;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.faceShape, formData.hairStyle, formData.eyeShape, formData.noseShape, formData.mouthShape]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setErrors({});
    }
  }, [currentStep, validateStep1]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  }, [currentStep]);

  // Stepper navigation (uses pure validation to avoid infinite loops)
  const canNavigateToStep = useCallback((stepId: number): boolean => {
    if (stepId < currentStep) return true;
    if (stepId === 2 && currentStep === 1) return isStep1Valid;
    return false;
  }, [currentStep, isStep1Valid]);

  const handleStepClick = useCallback((stepId: number) => {
    setCurrentStep(stepId);
    setErrors({});
  }, []);

  // Submission handlers
  const handleSubmit = useCallback(async (submitFn: (data: CreateCharacterData) => Promise<void>) => {
    setApiError(null);

    const step1Valid = validateStep1();
    if (!step1Valid) {
      setCurrentStep(1);
      return;
    }

    const step2Valid = validateStep2();
    if (!step2Valid) {
      setCurrentStep(2);
      return;
    }

    try {
      await submitFn(formData);
    } catch (error) {
      const apiErr = error as { message: string };
      setApiError(apiErr.message || FORM_ERRORS.GENERIC_ERROR);
    }
  }, [formData, validateStep1, validateStep2]);

  const handleSaveDraft = useCallback((e?: FormEvent) => {
    e?.preventDefault();
    handleSubmit(onSaveDraft);
  }, [handleSubmit, onSaveDraft]);

  const handleSubmitToModeration = useCallback(() => {
    if (onSubmitToModeration) {
      handleSubmit(onSubmitToModeration);
    }
  }, [handleSubmit, onSubmitToModeration]);

  // Reset & randomize handlers
  const handleReset = useCallback(() => {
    setFormData(initialData ?? { ...DEFAULT_CHARACTER_DATA });
    setErrors({});
    setApiError(null);
    setCurrentStep(1);
    resetNameCheck();
  }, [initialData, resetNameCheck]);

  const handleRandomize = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      skinColor: randomFrom(SKIN_COLORS),
      eyeColor: randomFrom(EYE_COLORS),
      hairColor: randomFrom(HAIR_COLORS),
      hairStyle: randomFrom(HAIR_STYLE_OPTIONS).id,
      eyeShape: randomFrom(EYE_SHAPE_OPTIONS).id,
      noseShape: randomFrom(NOSE_SHAPE_OPTIONS).id,
      mouthShape: randomFrom(MOUTH_SHAPE_OPTIONS).id,
      faceShape: randomFrom(FACE_SHAPE_OPTIONS).id,
    }));
    setErrors({});
  }, []);

  // Field update handler
  const updateField = useCallback(<K extends keyof CreateCharacterData>(
    field: K,
    value: CreateCharacterData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'name') {
      const nameError = validateCharacterName(value as string);
      setErrors((prev) => ({ ...prev, name: nameError }));
      if (!nameError) {
        checkNameAvailability(value as string);
      } else {
        resetNameCheck();
      }
    } else {
      setErrors((prev) => {
        if (prev[field]) {
          return { ...prev, [field]: '' };
        }
        return prev;
      });
    }

    setApiError(null);
  }, [checkNameAvailability, resetNameCheck]);

  // Check if name field should show availability indicator
  const showNameAvailability = !!(formData.name && formData.name.trim().length >= NAME_MIN_LENGTH);

  return (
    <form onSubmit={handleSaveDraft} noValidate>
      {apiError && (
        <Alert variant="error" className="mb-6" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <FormStepper
        steps={FORM_STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        canNavigateToStep={canNavigateToStep}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Left: Options Panel */}
        <div>
          {currentStep === 1 && (
            <IdentityStep
              formData={formData}
              errors={errors}
              classes={classes}
              classLoadError={classLoadError}
              isCheckingName={isCheckingName}
              nameAvailable={nameAvailable}
              showNameAvailability={showNameAvailability}
              characterStatus={characterStatus}
              onFieldChange={updateField}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <AppearanceStep
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              isLoadingDraft={isLoadingDraft}
              isLoadingSubmit={isLoadingSubmit}
              mode={mode}
              showSubmitToModeration={!!onSubmitToModeration}
              onFieldChange={updateField}
              onPrevious={handlePrevious}
              onSaveDraft={() => handleSaveDraft()}
              onSubmitToModeration={handleSubmitToModeration}
            />
          )}
        </div>

        {/* Right: Preview Panel */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-gradient-to-b from-dark-900 to-dark-800 border-2 border-gold-700 rounded-2xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
            <h2 className="font-display text-lg text-gold-400 text-center mb-6">
              Aperçu en temps réel
            </h2>

            <div className="bg-gradient-to-b from-dark-800 to-dark-900 rounded-xl border border-dark-700 p-6 mb-6">
              <CharacterPreview
                name={formData.name}
                className={selectedClassName}
                skinColor={formData.skinColor}
                hairColor={formData.hairColor}
                eyeColor={formData.eyeColor}
                faceShape={formData.faceShape}
                hairStyle={formData.hairStyle}
                eyeShape={formData.eyeShape}
                noseShape={formData.noseShape}
                mouthShape={formData.mouthShape}
              />
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full text-cream-500 hover:text-cream-300"
              >
                Réinitialiser
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleRandomize}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                <DiceIcon />
                Apparence aléatoire
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export { CharacterForm };
