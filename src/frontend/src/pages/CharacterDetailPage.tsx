import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCharacterPublic } from '../services/characterService';
import type { CharacterResponse } from '../types';
import { Header, Footer } from '../components/layout';
import { Button, Badge, Alert } from '../components/ui';
import { EditIcon, CLASS_ICONS } from '../components/ui/icons';
import { CharacterPreview } from '../components/character/CharacterPreview';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  Draft: { label: 'Brouillon', variant: 'default' },
  Pending: { label: 'En attente', variant: 'warning' },
  Approved: { label: 'Approuvé', variant: 'success' },
  Rejected: { label: 'Rejeté', variant: 'error' },
};

const GENDER_LABELS: Record<string, string> = {
  Male: 'Masculin',
  Female: 'Féminin',
};

const HAIR_STYLE_LABELS: Record<string, string> = {
  court: 'Court',
  long: 'Long',
  tresse: 'Tresses',
  rase: 'Rasé',
  boucle: 'Bouclé',
  queue: 'Queue de cheval',
  mohawk: 'Mohawk',
  dreadlocks: 'Dreadlocks',
};

const FACE_SHAPE_LABELS: Record<string, string> = {
  rond: 'Rond',
  ovale: 'Ovale',
  carre: 'Carré',
  allonge: 'Allongé',
};

const EYE_SHAPE_LABELS: Record<string, string> = {
  amande: 'Amande',
  rond: 'Rond',
  tombant: 'Tombant',
  bride: 'Bridé',
  enfonce: 'Enfoncé',
  ecarquille: 'Écarquillé',
};

const NOSE_SHAPE_LABELS: Record<string, string> = {
  droit: 'Droit',
  courbe: 'Courbé',
  retrousse: 'Retroussé',
  large: 'Large',
  fin: 'Fin',
};

const MOUTH_SHAPE_LABELS: Record<string, string> = {
  fine: 'Fine',
  charnue: 'Charnue',
  moyenne: 'Moyenne',
  large: 'Large',
  asymetrique: 'Asymétrique',
  pincee: 'Pincée',
};

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="w-10 h-10 rounded-full border-2 border-dark-600 shadow-md"
        style={{ backgroundColor: color }}
        role="img"
        aria-label={`${label} : ${color}`}
      />
      <span className="text-xs text-cream-500 text-center">{label}</span>
    </div>
  );
}

function ShapeDetail({ label, value, labels }: { label: string; value: string; labels: Record<string, string> }) {
  return (
    <div className="bg-dark-800 rounded-lg px-4 py-3">
      <p className="text-xs text-cream-500 mb-1">{label}</p>
      <p className="text-cream-200 font-medium">{labels[value] ?? value}</p>
    </div>
  );
}

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<CharacterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      try {
        const data = await getCharacterPublic(Number(id), token);
        setCharacter(data);
      } catch (err) {
        const apiError = err as { status?: number };
        setError(
          apiError.status === 404
            ? 'Personnage introuvable.'
            : 'Une erreur est survenue lors du chargement.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacter();
  }, [id, token]);

  const statusConfig = character ? STATUS_CONFIG[character.status] ?? STATUS_CONFIG.Draft : null;
  const genderLabel = character ? GENDER_LABELS[character.gender] ?? character.gender : '';

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="main-content" role="main" className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          {isLoading && (
            <div className="flex justify-center py-20" role="status" aria-label="Chargement">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
            </div>
          )}

          {error && (
            <div className="max-w-lg mx-auto py-20 text-center">
              <Alert variant="error" className="mb-6">{error}</Alert>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Retour
              </Button>
            </div>
          )}

          {!isLoading && !error && character && (
            <>
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left column: Preview */}
                <div className="flex justify-center lg:justify-start shrink-0">
                  <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                    <CharacterPreview
                      name={character.name}
                      className={character.className}
                      skinColor={character.skinColor}
                      hairColor={character.hairColor}
                      eyeColor={character.eyeColor}
                      faceShape={character.faceShape}
                      hairStyle={character.hairStyle}
                      eyeShape={character.eyeShape}
                      noseShape={character.noseShape}
                      mouthShape={character.mouthShape}
                    />
                  </div>
                </div>

                {/* Right column: Details */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex flex-wrap items-start gap-3 mb-6">
                    <h1 className="text-3xl sm:text-4xl font-display text-gold-300">
                      {character.name}
                    </h1>
                    {statusConfig && (character.isOwner || character.status === 'Approved') && (
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-3 mb-6">
                    {CLASS_ICONS[character.className] && (
                      <span className="w-8 h-8 text-gold-400" aria-hidden="true">
                        {CLASS_ICONS[character.className]}
                      </span>
                    )}
                    <span className="text-cream-300">{character.className}</span>
                    <span className="text-cream-500" aria-hidden="true">·</span>
                    <span className="text-cream-300">{genderLabel}</span>
                  </div>

                  {/* Shared indicator (owner only + Approved) */}
                  {character.isOwner && character.status === 'Approved' && (
                    <span
                      className={`inline-block mb-6 text-xs px-2 py-0.5 rounded ${
                        character.isShared
                          ? 'bg-gold-500/20 text-gold-400'
                          : 'bg-dark-700 text-cream-500'
                      }`}
                    >
                      {character.isShared ? 'Partagé' : 'Privé'}
                    </span>
                  )}

                  {/* Appearance section */}
                  <section aria-labelledby="appearance-heading" className="mt-2 bg-dark-900/50 border border-dark-700 rounded-xl p-5">
                    <h2 id="appearance-heading" className="text-lg font-medium text-cream-100 mb-4">
                      Apparence
                    </h2>

                    {/* Colors */}
                    <div className="flex gap-6 mb-5">
                      <ColorSwatch color={character.skinColor} label="Peau" />
                      <ColorSwatch color={character.hairColor} label="Cheveux" />
                      <ColorSwatch color={character.eyeColor} label="Yeux" />
                    </div>

                    {/* Shapes */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <ShapeDetail label="Visage" value={character.faceShape} labels={FACE_SHAPE_LABELS} />
                      <ShapeDetail label="Cheveux" value={character.hairStyle} labels={HAIR_STYLE_LABELS} />
                      <ShapeDetail label="Yeux" value={character.eyeShape} labels={EYE_SHAPE_LABELS} />
                      <ShapeDetail label="Nez" value={character.noseShape} labels={NOSE_SHAPE_LABELS} />
                      <ShapeDetail label="Bouche" value={character.mouthShape} labels={MOUTH_SHAPE_LABELS} />
                    </div>
                  </section>

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-dark-700 flex flex-wrap gap-3">
                    {character.isOwner && (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => navigate(`/characters/${character.id}/edit`)}
                          aria-label={`Modifier ${character.name}`}
                        >
                          <EditIcon />
                          <span className="ml-1.5">Modifier</span>
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => navigate('/dashboard')}
                        >
                          Retour au tableau de bord
                        </Button>
                      </>
                    )}
                    {!character.isOwner && (
                      <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                      >
                        Retour
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
