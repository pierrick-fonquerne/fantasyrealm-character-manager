export interface CharacterResponse {
  id: number;
  name: string;
  classId: number;
  className: string;
  gender: string;
  status: string;
  skinColor: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
  faceShape: string;
  isShared: boolean;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterSummary {
  id: number;
  name: string;
  className: string;
  status: string;
  gender: string;
  isShared: boolean;
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  faceShape: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
}

export interface NameAvailabilityResponse {
  available: boolean;
}
