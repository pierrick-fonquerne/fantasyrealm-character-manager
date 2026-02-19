import type { ReactNode } from 'react';

// Validation constants
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

// Error messages
export const NAME_ERRORS = {
  REQUIRED: 'Le nom est requis',
  TOO_SHORT: `Le nom doit contenir au moins ${NAME_MIN_LENGTH} caractères`,
  TOO_LONG: `Le nom ne peut pas dépasser ${NAME_MAX_LENGTH} caractères`,
  ALREADY_TAKEN: 'Ce nom est déjà pris',
} as const;

export const FORM_ERRORS = {
  CLASS_REQUIRED: 'La classe est requise',
  GENDER_REQUIRED: 'Le genre est requis',
  FACE_SHAPE_REQUIRED: 'La forme du visage est requise',
  HAIR_STYLE_REQUIRED: 'Le style de cheveux est requis',
  EYE_SHAPE_REQUIRED: 'La forme des yeux est requise',
  NOSE_SHAPE_REQUIRED: 'La forme du nez est requise',
  MOUTH_SHAPE_REQUIRED: 'La forme de la bouche est requise',
  GENERIC_ERROR: 'Une erreur est survenue',
} as const;

// Color palettes
export const SKIN_COLORS = [
  '#FFDFC4', '#F0C8A0', '#DEB887', '#C19A6B',
  '#8D5524', '#5C3D2E', '#A5D6A7', '#90CAF9',
] as const;

export const HAIR_COLORS = [
  '#1A1A1A', '#4A3C31', '#8B4513', '#DAA520',
  '#CD853F', '#E0E0E0', '#DC143C', '#9C27B0',
] as const;

export const EYE_COLORS = [
  '#4A3C31', '#2196F3', '#4CAF50', '#9E9E9E',
  '#F59E0B', '#EF4444',
] as const;

// Shape option type
export interface ShapeOption {
  id: string;
  label: string;
  preview: ReactNode;
}

// Gender options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Masculin' },
  { value: 'Female', label: 'Féminin' },
] as const;

// Class display order
export const CLASS_ORDER = ['Guerrier', 'Archer', 'Mage', 'Voleur'] as const;

// Form steps
export const FORM_STEPS = [
  { id: 1, title: 'Identité', description: 'Nom, classe et genre' },
  { id: 2, title: 'Apparence', description: 'Personnalisation visuelle' },
] as const;

// Default form values
export const DEFAULT_CHARACTER_DATA = {
  name: '',
  classId: 0,
  gender: '',
  skinColor: '#C19A6B',
  eyeColor: '#2196F3',
  hairColor: '#4A3C31',
  hairStyle: 'court',
  eyeShape: 'amande',
  noseShape: 'droit',
  mouthShape: 'moyenne',
  faceShape: 'ovale',
} as const;

// Helper to pick a random element from an array
export const randomFrom = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
