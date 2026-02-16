import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { CharacterForm } from '../components/character';
import { getCharacter, updateCharacter, submitCharacter } from '../services/characterService';
import type { CreateCharacterData, CharacterResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Alert, Button } from '../components/ui';

const mapToFormData = (character: CharacterResponse): CreateCharacterData => ({
  name: character.name,
  classId: character.classId,
  gender: character.gender,
  skinColor: character.skinColor,
  eyeColor: character.eyeColor,
  hairColor: character.hairColor,
  hairStyle: character.hairStyle,
  eyeShape: character.eyeShape,
  noseShape: character.noseShape,
  mouthShape: character.mouthShape,
  faceShape: character.faceShape,
});

const EditCharacterPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [character, setCharacter] = useState<CharacterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!token || !id) return;
      try {
        const data = await getCharacter(Number(id), token);
        setCharacter(data);
      } catch (err) {
        const apiError = err as { status?: number; message?: string };
        if (apiError.status === 404) {
          setError('Personnage introuvable.');
        } else if (apiError.status === 403) {
          setError('Vous n\'avez pas accès à ce personnage.');
        } else {
          setError('Une erreur est survenue lors du chargement.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacter();
  }, [id, token]);

  const handleSave = async (data: CreateCharacterData) => {
    if (!token || !id) return;
    setIsLoadingDraft(true);
    try {
      await updateCharacter(Number(id), data, token);
      navigate('/dashboard');
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleSubmitToModeration = async (data: CreateCharacterData) => {
    if (!token || !id) return;
    setIsLoadingSubmit(true);
    try {
      await updateCharacter(Number(id), data, token);
      await submitCharacter(Number(id), token);
      navigate('/dashboard');
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const canSubmitToModeration =
    character?.status === 'Draft' || character?.status === 'Rejected';

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="main-content" role="main" className="flex-1 px-4 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-gold-400">
              Modification de Personnage
            </h1>
            <p className="text-cream-400 mt-2">
              Modifiez votre héros
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
            </div>
          )}

          {error && (
            <div className="max-w-lg mx-auto py-20 text-center">
              <Alert variant="error" className="mb-6">{error}</Alert>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Retour au tableau de bord
              </Button>
            </div>
          )}

          {!isLoading && !error && character && (
            <CharacterForm
              initialData={mapToFormData(character)}
              characterId={character.id}
              characterStatus={character.status}
              onSaveDraft={handleSave}
              onSubmitToModeration={canSubmitToModeration ? handleSubmitToModeration : undefined}
              isLoadingDraft={isLoadingDraft}
              isLoadingSubmit={isLoadingSubmit}
              mode="edit"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditCharacterPage;
