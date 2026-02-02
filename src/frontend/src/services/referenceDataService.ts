import { apiClient } from './api';

export interface CharacterClass {
  id: number;
  name: string;
  description: string;
  iconUrl: string | null;
}

export interface EquipmentSlot {
  id: number;
  name: string;
  displayOrder: number;
}

export const fetchCharacterClasses = (): Promise<CharacterClass[]> =>
  apiClient.get<CharacterClass[]>('/character-classes');

export const fetchEquipmentSlots = (): Promise<EquipmentSlot[]> =>
  apiClient.get<EquipmentSlot[]>('/equipment-slots');
