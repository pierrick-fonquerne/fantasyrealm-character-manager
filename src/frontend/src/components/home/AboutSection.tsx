const AboutSection = () => {
  const features = [
    '100+ options de personnalisation',
    '8 classes jouables uniques',
    'Sauvegarde cloud illimitée',
  ];

  return (
    <section className="py-16 lg:py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image / Illustration */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-video bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden flex items-center justify-center">
              {/* Placeholder for game screenshot or illustration */}
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gold-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-dark-400 text-sm">Vidéo de présentation</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-cream-100 mb-6">
              À propos de{' '}
              <span className="text-gold-400">FantasyRealm</span>
            </h2>

            <p className="text-cream-300 leading-relaxed mb-6">
              FantasyRealm Online est un MMORPG développé par PixelVerse Studios.
              Notre outil de création vous permet de personnaliser votre héros unique
              parmi des milliers de combinaisons possibles.
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-success-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-cream-200">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Studio info */}
            <div className="flex items-center gap-4 pt-6 border-t border-dark-700">
              <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-center">
                <span className="font-display text-gold-400 font-bold text-lg">P</span>
              </div>
              <div>
                <div className="font-medium text-cream-200">PixelVerse Studios</div>
                <div className="text-sm text-dark-300">Créateurs de mondes fantastiques depuis 2015</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
