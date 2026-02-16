import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { CharacterForm } from '../components/character';
import { createCharacter, submitCharacter } from '../services/characterService';
import type { CreateCharacterData } from '../types';
import { useAuth } from '../context/AuthContext';

const CreateCharacterPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleSaveDraft = async (data: CreateCharacterData) => {
    if (!token) return;
    setIsLoadingDraft(true);
    try {
      await createCharacter(data, token);
      navigate('/dashboard');
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleSubmitToModeration = async (data: CreateCharacterData) => {
    if (!token) return;
    setIsLoadingSubmit(true);
    try {
      const character = await createCharacter(data, token);
      await submitCharacter(character.id, token);
      navigate('/dashboard');
    } finally {
      setIsLoadingSubmit(false);
    }
  };

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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-gold-400">
              Création de Personnage
            </h1>
            <p className="text-cream-400 mt-2">
              Forgez votre héros légendaire
            </p>
          </div>

          <CharacterForm
            onSaveDraft={handleSaveDraft}
            onSubmitToModeration={handleSubmitToModeration}
            isLoadingDraft={isLoadingDraft}
            isLoadingSubmit={isLoadingSubmit}
            mode="create"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCharacterPage;
