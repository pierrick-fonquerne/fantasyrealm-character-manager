export interface GalleryCharacter {
  id: number;
  name: string;
  className: string;
  gender: string;
  authorPseudo: string;
  createdAt: string;
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  faceShape: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
}

export type GallerySort = 'recent' | 'oldest' | 'nameAsc';
export type GalleryGender = 'Male' | 'Female';

export interface GalleryFilters {
  gender?: GalleryGender;
  author?: string;
  sort?: GallerySort;
  page?: number;
}
