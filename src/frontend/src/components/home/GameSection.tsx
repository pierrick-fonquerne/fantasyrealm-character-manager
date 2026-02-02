import type { IconType } from 'react-icons';
import { GiBroadsword, GiWizardStaff, GiBowArrow, GiDaggers } from 'react-icons/gi';

interface CharacterClass {
  name: string;
  icon: IconType;
}

const classes: CharacterClass[] = [
  { name: 'Guerrier', icon: GiBroadsword },
  { name: 'Mage', icon: GiWizardStaff },
  { name: 'Archer', icon: GiBowArrow },
  { name: 'Voleur', icon: GiDaggers },
];

const features = [
  {
    title: 'Combats épiques',
    description: 'Affrontez des créatures légendaires dans des batailles en temps réel.',
  },
  {
    title: 'Monde ouvert',
    description: 'Explorez un univers vaste et détaillé, rempli de secrets à découvrir.',
  },
  {
    title: 'Guildes et raids',
    description: 'Rejoignez des guildes et participez à des raids coopératifs massifs.',
  },
  {
    title: 'Personnalisation',
    description: 'Créez un héros unique parmi 4 classes avec des centaines d\'options.',
  },
];

const GameSection = () => {
  return (
    <section aria-labelledby="game-heading" className="py-16 lg:py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2
            id="game-heading"
            className="text-3xl lg:text-4xl font-display font-bold text-cream-100 mb-4"
          >
            FantasyRealm <span className="text-gold-400">Online</span>
          </h2>
          <p className="text-cream-300 max-w-2xl mx-auto">
            Plongez dans un monde fantastique où des millions de joueurs forgent leur destin.
            Le MMORPG phare de PixelVerse Studios vous attend.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 text-center hover:border-gold-500/30 transition-colors"
            >
              <h3 className="text-xl font-semibold text-cream-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-cream-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-2xl font-display font-bold text-cream-100 text-center mb-4">
            4 classes jouables
          </h3>
          <p className="text-cream-400 text-center mb-8 max-w-2xl mx-auto">
            Choisissez votre voie parmi nos classes uniques, chacune avec ses propres
            compétences et style de jeu.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {classes.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-center hover:border-gold-500/50 hover:bg-dark-800/80 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-dark-700 flex items-center justify-center text-gold-400">
                  <Icon size={32} />
                </div>
                <span className="text-cream-200 font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSection;
