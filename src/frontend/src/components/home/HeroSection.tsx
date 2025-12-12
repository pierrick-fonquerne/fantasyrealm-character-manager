import { Button, Badge } from '../ui';

const HeroSection = () => {
  const stats = [
    { value: '12K+', label: 'Personnages' },
    { value: '5K+', label: 'Joueurs' },
    { value: '8', label: 'Classes' },
  ];

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <Badge variant="gold" className="mb-6">
              Nouveau
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-cream-100 mb-6 leading-tight">
              Forgez votre héros{' '}
              <span className="text-gold-400">légendaire</span>
            </h1>

            <p className="text-lg text-cream-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Personnalisez chaque détail de votre personnage dans FantasyRealm Online.
              Créez, équipez et partagez vos héros avec la communauté.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg">
                Créer un personnage
              </Button>
              <Button variant="outline" size="lg">
                Explorer la galerie
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8 lg:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl lg:text-3xl font-display font-bold text-gold-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-dark-200 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative hidden lg:block">
            <div className="aspect-[3/4] bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
              {/* Placeholder for character image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-dark-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-dark-400 text-sm">Aperçu du personnage</p>
                </div>
              </div>

              {/* Decorative border glow */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold-500/10" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-dark-800 border border-dark-600 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gold-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-cream-200">Personnalisation</div>
                  <div className="text-xs text-dark-300">100+ options</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
