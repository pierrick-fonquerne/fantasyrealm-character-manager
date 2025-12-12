import { Badge } from '../ui';

interface Hero {
  id: string;
  name: string;
  className: string;
  classColor: 'default' | 'gold' | 'success' | 'error' | 'warning' | 'info';
  level: number;
  likes: number;
  views: number;
}

const PopularHeroesSection = () => {
  const heroes: Hero[] = [
    {
      id: '1',
      name: 'Ragnar Forgeheart',
      className: 'Guerrier',
      classColor: 'error',
      level: 42,
      likes: 156,
      views: 1200,
    },
    {
      id: '2',
      name: 'Élara Frostweaver',
      className: 'Mage',
      classColor: 'info',
      level: 38,
      likes: 89,
      views: 834,
    },
    {
      id: '3',
      name: 'Vex Shadowbane',
      className: 'Voleur',
      classColor: 'warning',
      level: 55,
      likes: 234,
      views: 2100,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-cream-100">
            Héros <span className="text-gold-400">populaires</span>
          </h2>
          <a
            href="/galerie"
            className="flex items-center gap-2 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Heroes List */}
        <div className="space-y-4">
          {heroes.map((hero) => (
            <div
              key={hero.id}
              className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700 hover:border-dark-600 transition-colors cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-dark-500"
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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-cream-100 truncate">
                  {hero.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={hero.classColor} size="sm">
                    {hero.className}
                  </Badge>
                  <span className="text-sm text-dark-300">Niveau {hero.level}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-sm text-dark-300">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-error-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {hero.likes}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {hero.views}
                </div>
              </div>

              {/* Arrow */}
              <svg
                className="w-5 h-5 text-dark-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularHeroesSection;
