import type { ShapeOption } from './characterOptions';

export const FACE_SHAPE_OPTIONS: ShapeOption[] = [
  { id: 'rond', label: 'Rond', preview: <div className="w-10 h-10 bg-gold-400 rounded-full" /> },
  { id: 'ovale', label: 'Ovale', preview: <div className="w-8 h-10 bg-gold-400 rounded-[50%_50%_45%_45%]" /> },
  { id: 'carre', label: 'Carré', preview: <div className="w-10 h-10 bg-gold-400 rounded-[10%]" /> },
  { id: 'allonge', label: 'Allongé', preview: <div className="w-7 h-10 bg-gold-400 rounded-[40%_40%_50%_50%]" /> },
];

export const HAIR_STYLE_OPTIONS: ShapeOption[] = [
  { id: 'court', label: 'Court', preview: <div className="w-10 h-6 bg-gold-400 rounded-t-full" /> },
  { id: 'long', label: 'Long', preview: <div className="w-10 h-10 bg-gold-400 rounded-[50%_50%_20%_20%]" /> },
  { id: 'tresse', label: 'Tressé', preview: <div className="w-10 h-9 bg-gold-400 rounded-[50%_50%_10%_10%]" /> },
  { id: 'rase', label: 'Rasé', preview: <div className="w-10 h-4 bg-gold-400 rounded-t-full" /> },
  { id: 'boucle', label: 'Bouclé', preview: <div className="w-10 h-8 bg-gold-400 rounded-[45%_45%_30%_30%]" /> },
  { id: 'queue', label: 'Queue de cheval', preview: <div className="w-10 h-7 bg-gold-400 rounded-t-full" /> },
  { id: 'mohawk', label: 'Mohawk', preview: <div className="w-5 h-9 bg-gold-400 rounded-[30%_30%_0_0]" /> },
  { id: 'dreadlocks', label: 'Dreadlocks', preview: <div className="w-10 h-10 bg-gold-400 rounded-[40%_40%_20%_20%]" /> },
];

export const EYE_SHAPE_OPTIONS: ShapeOption[] = [
  { id: 'amande', label: 'En amande', preview: <div className="w-10 h-4 bg-gold-400 rounded-full" style={{ transform: 'rotate(-5deg)' }} /> },
  { id: 'rond', label: 'Ronds', preview: <div className="w-6 h-6 bg-gold-400 rounded-full" /> },
  { id: 'tombant', label: 'Tombants', preview: <div className="w-10 h-4 bg-gold-400 rounded-full" style={{ transform: 'rotate(10deg)' }} /> },
  { id: 'bride', label: 'Bridés', preview: <div className="w-10 h-3 bg-gold-400 rounded-full" style={{ transform: 'rotate(-10deg)' }} /> },
  { id: 'enfonce', label: 'Enfoncés', preview: <div className="w-5 h-5 bg-gold-400 rounded-full border-2 border-dark-600" /> },
  { id: 'ecarquille', label: 'Écarquillés', preview: <div className="w-7 h-7 bg-gold-400 rounded-full" /> },
];

export const NOSE_SHAPE_OPTIONS: ShapeOption[] = [
  { id: 'droit', label: 'Droit', preview: <div className="w-2 h-10 bg-gold-400 rounded-sm" /> },
  { id: 'courbe', label: 'Courbé', preview: <div className="w-3 h-10 bg-gold-400 rounded-[30%_30%_50%_50%]" style={{ transform: 'skewX(-5deg)' }} /> },
  { id: 'retrousse', label: 'Retroussé', preview: <div className="w-3 h-8 bg-gold-400 rounded-[50%_50%_30%_30%]" /> },
  { id: 'large', label: 'Large', preview: <div className="w-5 h-10 bg-gold-400 rounded-[20%_20%_40%_40%]" /> },
  { id: 'fin', label: 'Fin', preview: <div className="w-1.5 h-10 bg-gold-400 rounded-sm" /> },
];

export const MOUTH_SHAPE_OPTIONS: ShapeOption[] = [
  { id: 'fine', label: 'Fine', preview: <div className="w-10 h-1.5 bg-gold-400 rounded-full" /> },
  { id: 'charnue', label: 'Charnue', preview: <div className="w-10 h-4 bg-gold-400 rounded-full" /> },
  { id: 'moyenne', label: 'Moyenne', preview: <div className="w-10 h-3 bg-gold-400 rounded-full" /> },
  { id: 'large', label: 'Large', preview: <div className="w-10 h-3 bg-gold-400 rounded-[40%]" /> },
  { id: 'asymetrique', label: 'Asymétrique', preview: <div className="w-10 h-2.5 bg-gold-400 rounded-full" style={{ transform: 'skewX(10deg)' }} /> },
  { id: 'pincee', label: 'Pincée', preview: <div className="w-6 h-2 bg-gold-400 rounded-full" /> },
];
