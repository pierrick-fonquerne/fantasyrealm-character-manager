import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { Button, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getMyCharacters, type CharacterSummary } from '../services/characterService';

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  Draft: { label: 'Brouillon', variant: 'default' },
  Pending: { label: 'En attente', variant: 'info' },
  Approved: { label: 'Approuvé', variant: 'success' },
  Rejected: { label: 'Rejeté', variant: 'error' },
};

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getMyCharacters(token)
      .then(setCharacters)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-gold-500">
              Bienvenue, <span className="text-cream-100">{user?.pseudo}</span>
            </h1>
            <Link to="/characters/create">
              <Button variant="primary">Créer un personnage</Button>
            </Link>
          </div>

          <section aria-label="Mes personnages">
            <h2 className="font-display text-xl text-cream-200 mb-4">Mes personnages</h2>

            {isLoading ? (
              <p className="text-cream-400">Chargement...</p>
            ) : characters.length === 0 ? (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
                <p className="text-cream-400 mb-4">
                  Vous n'avez pas encore de personnage.
                </p>
                <Link to="/characters/create">
                  <Button variant="primary">Créer mon premier personnage</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {characters.map((character) => {
                  const badge = STATUS_BADGE[character.status] ?? STATUS_BADGE.Draft;
                  return (
                    <Link
                      key={character.id}
                      to={`/characters/${character.id}`}
                      className="block bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-gold-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-cream-100">{character.name}</h3>
                          <p className="text-sm text-cream-400">
                            {character.className} · {character.gender === 'Male' ? 'Masculin' : 'Féminin'}
                          </p>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
