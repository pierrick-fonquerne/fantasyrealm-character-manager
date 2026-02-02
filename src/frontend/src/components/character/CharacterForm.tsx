import { useState, useEffect, type FormEvent } from 'react';
import { Input, Select, RadioGroup, Button, Alert } from '../ui';
import { fetchCharacterClasses, type CharacterClass } from '../../services/referenceDataService';
import type { CreateCharacterData } from '../../services/characterService';

const HAIR_STYLE_OPTIONS = [
  { value: 'court', label: 'Court' },
  { value: 'long', label: 'Long' },
  { value: 'tresse', label: 'Tressé' },
  { value: 'rase', label: 'Rasé' },
  { value: 'boucle', label: 'Bouclé' },
  { value: 'queue-de-cheval', label: 'Queue de cheval' },
  { value: 'mohawk', label: 'Mohawk' },
  { value: 'dreadlocks', label: 'Dreadlocks' },
];

const EYE_SHAPE_OPTIONS = [
  { value: 'amande', label: 'En amande' },
  { value: 'rond', label: 'Ronds' },
  { value: 'tombant', label: 'Tombants' },
  { value: 'bride', label: 'Bridés' },
  { value: 'enfonce', label: 'Enfoncés' },
  { value: 'ecarquille', label: 'Écarquillés' },
];

const NOSE_SHAPE_OPTIONS = [
  { value: 'droit', label: 'Droit' },
  { value: 'courbe', label: 'Courbé' },
  { value: 'retrousse', label: 'Retroussé' },
  { value: 'large', label: 'Large' },
  { value: 'fin', label: 'Fin' },
];

const MOUTH_SHAPE_OPTIONS = [
  { value: 'fine', label: 'Fine' },
  { value: 'charnue', label: 'Charnue' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'large', label: 'Large' },
  { value: 'asymetrique', label: 'Asymétrique' },
  { value: 'pincee', label: 'Pincée' },
];

const FACE_SHAPE_OPTIONS = [
  { value: 'ovale', label: 'Ovale' },
  { value: 'rond', label: 'Rond' },
  { value: 'carre', label: 'Carré' },
  { value: 'allonge', label: 'Allongé' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Masculin' },
  { value: 'Female', label: 'Féminin' },
];

interface CharacterFormProps {
  initialData?: CreateCharacterData;
  onSubmit: (data: CreateCharacterData) => Promise<void>;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const CharacterForm = ({ initialData, onSubmit, isLoading, mode }: CharacterFormProps) => {
  const [classes, setClasses] = useState<CharacterClass[]>([]);
  const [formData, setFormData] = useState<CreateCharacterData>(
    initialData ?? {
      name: '',
      classId: 0,
      gender: '',
      skinColor: '#E8BEAC',
      eyeColor: '#4A90D9',
      hairColor: '#2C1810',
      hairStyle: '',
      eyeShape: '',
      noseShape: '',
      mouthShape: '',
      faceShape: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacterClasses().then(setClasses).catch(() => {});
  }, []);

  const classOptions = classes.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (!formData.classId) {
      newErrors.classId = 'La classe est requise';
    }

    if (!formData.gender) {
      newErrors.gender = 'Le genre est requis';
    }

    if (!formData.hairStyle) {
      newErrors.hairStyle = 'Le style de cheveux est requis';
    }

    if (!formData.eyeShape) {
      newErrors.eyeShape = 'La forme des yeux est requise';
    }

    if (!formData.noseShape) {
      newErrors.noseShape = 'La forme du nez est requise';
    }

    if (!formData.mouthShape) {
      newErrors.mouthShape = 'La forme de la bouche est requise';
    }

    if (!formData.faceShape) {
      newErrors.faceShape = 'La forme du visage est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      const apiErr = error as { message: string };
      setApiError(apiErr.message || 'Une erreur est survenue');
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError(null);
  };

  const handleSelectChange = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const val = field === 'classId' ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError(null);
  };

  const handleRadioChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError(null);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && (
        <Alert variant="error" className="mb-6" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <div className="space-y-8">
        {/* Identité */}
        <fieldset>
          <legend className="font-display text-xl text-gold-500 mb-4">Identité</legend>
          <div className="space-y-4">
            <Input
              label="Nom du personnage"
              placeholder="Ex: Arthas, Legolas..."
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.name}
              required
            />

            <Select
              label="Classe"
              placeholder="Choisir une classe"
              options={classOptions}
              value={String(formData.classId || '')}
              onChange={handleSelectChange('classId')}
              error={errors.classId}
              required
            />

            <RadioGroup
              label="Genre"
              name="gender"
              options={GENDER_OPTIONS}
              value={formData.gender}
              onChange={handleRadioChange('gender')}
              error={errors.gender}
            />
          </div>
        </fieldset>

        {/* Couleurs */}
        <fieldset>
          <legend className="font-display text-xl text-gold-500 mb-4">Couleurs</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="skinColor" className="block text-sm font-medium text-cream-200 mb-1">
                Peau <span className="text-red-400">*</span>
              </label>
              <input
                id="skinColor"
                type="color"
                value={formData.skinColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, skinColor: e.target.value }))}
                className="w-full h-10 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="eyeColor" className="block text-sm font-medium text-cream-200 mb-1">
                Yeux <span className="text-red-400">*</span>
              </label>
              <input
                id="eyeColor"
                type="color"
                value={formData.eyeColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, eyeColor: e.target.value }))}
                className="w-full h-10 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="hairColor" className="block text-sm font-medium text-cream-200 mb-1">
                Cheveux <span className="text-red-400">*</span>
              </label>
              <input
                id="hairColor"
                type="color"
                value={formData.hairColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, hairColor: e.target.value }))}
                className="w-full h-10 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer"
              />
            </div>
          </div>
        </fieldset>

        {/* Morphologie */}
        <fieldset>
          <legend className="font-display text-xl text-gold-500 mb-4">Morphologie</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Style de cheveux"
              placeholder="Choisir un style"
              options={HAIR_STYLE_OPTIONS}
              value={formData.hairStyle}
              onChange={handleSelectChange('hairStyle')}
              error={errors.hairStyle}
              required
            />

            <Select
              label="Forme des yeux"
              placeholder="Choisir une forme"
              options={EYE_SHAPE_OPTIONS}
              value={formData.eyeShape}
              onChange={handleSelectChange('eyeShape')}
              error={errors.eyeShape}
              required
            />

            <Select
              label="Forme du nez"
              placeholder="Choisir une forme"
              options={NOSE_SHAPE_OPTIONS}
              value={formData.noseShape}
              onChange={handleSelectChange('noseShape')}
              error={errors.noseShape}
              required
            />

            <Select
              label="Forme de la bouche"
              placeholder="Choisir une forme"
              options={MOUTH_SHAPE_OPTIONS}
              value={formData.mouthShape}
              onChange={handleSelectChange('mouthShape')}
              error={errors.mouthShape}
              required
            />

            <Select
              label="Forme du visage"
              placeholder="Choisir une forme"
              options={FACE_SHAPE_OPTIONS}
              value={formData.faceShape}
              onChange={handleSelectChange('faceShape')}
              error={errors.faceShape}
              required
            />
          </div>
        </fieldset>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        className="mt-8"
      >
        {mode === 'create' ? 'Créer le personnage' : 'Enregistrer les modifications'}
      </Button>
    </form>
  );
};

export { CharacterForm };
