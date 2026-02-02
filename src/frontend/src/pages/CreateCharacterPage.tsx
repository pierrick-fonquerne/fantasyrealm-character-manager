import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { CharacterForm } from '../components/character';
import { createCharacter, type CreateCharacterData } from '../services/characterService';
import { useAuth } from '../context/AuthContext';

const CreateCharacterPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateCharacterData) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await createCharacter(data, token);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
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

      <main id="main-content" role="main" className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl text-gold-500 mb-8 text-center">
            Créer un personnage
          </h1>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 md:p-8">
            <CharacterForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              mode="create"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCharacterPage;
