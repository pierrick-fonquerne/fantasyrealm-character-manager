const CompanySection = () => {
  const stats = [
    { value: '2015', label: 'Fondation' },
    { value: '5M+', label: 'Joueurs' },
    { value: '150+', label: 'Employés' },
    { value: '12', label: 'Titres publiés' },
  ];

  return (
    <section aria-labelledby="company-heading" className="py-16 lg:py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              id="company-heading"
              className="text-3xl lg:text-4xl font-display font-bold text-cream-100 mb-6"
            >
              PixelVerse <span className="text-gold-400">Studios</span>
            </h2>

            <p className="text-cream-300 leading-relaxed mb-6">
              Fondé en 2015, PixelVerse Studios est un studio de développement de jeux vidéo
              spécialisé dans les jeux de rôle en ligne massivement multijoueurs. Notre passion :
              créer des mondes immersifs où chaque joueur peut vivre des aventures uniques.
            </p>

            <p className="text-cream-300 leading-relaxed">
              Reconnu pour ses titres populaires dans l'univers du MMORPG, notre équipe de plus
              de 150 passionnés conçoit des expériences de jeu innovantes qui rassemblent des
              millions de joueurs à travers le monde.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 text-center hover:border-gold-500/30 transition-colors"
              >
                <div className="text-3xl lg:text-4xl font-display font-bold text-gold-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-cream-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanySection;
