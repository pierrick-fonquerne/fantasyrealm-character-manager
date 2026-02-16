export interface CreateCharacterData {
  name: string;
  classId: number;
  gender: string;
  skinColor: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
  faceShape: string;
}

export type UpdateCharacterData = CreateCharacterData;
