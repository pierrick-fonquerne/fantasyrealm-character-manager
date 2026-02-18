export interface PendingCharacter {
  id: number;
  name: string;
  className: string;
  gender: string;
  skinColor: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
  faceShape: string;
  ownerPseudo: string;
  submittedAt: string;
}

export interface UserManagement {
  id: number;
  pseudo: string;
  email: string;
  isSuspended: boolean;
  createdAt: string;
  characterCount: number;
}
