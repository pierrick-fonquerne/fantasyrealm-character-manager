import { Card, CardBody } from '../ui';

interface Advantage {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AdvantagesSection = () => {
  const advantages: Advantage[] = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      title: 'Personnalisation avancée',
      description:
        'Modifiez chaque trait du visage de votre personnage avec précision : yeux, nez, bouche, couleur de peau, cheveux et bien plus encore.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      ),
      title: 'Partagez vos créations',
      description:
        'Publiez vos personnages dans la galerie communautaire et découvrez les créations des autres joueurs. Laissez des avis et recevez des retours.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: 'Équipements variés',
      description:
        'Armes, armures, vêtements, accessoires… Des centaines d\'articles proposés par la plateforme pour rendre votre héros unique.',
    },
  ];

  return (
    <section aria-labelledby="advantages-heading" className="py-16 lg:py-24 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2
            id="advantages-heading"
            className="text-3xl lg:text-4xl font-display font-bold text-cream-100 mb-4"
          >
            Pourquoi utiliser notre <span className="text-gold-400">gestionnaire</span> ?
          </h2>
          <p className="text-cream-300 max-w-2xl mx-auto">
            Découvrez les avantages de notre système de gestion de personnages
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {advantages.map((advantage) => (
            <Card
              key={advantage.title}
              variant="default"
              className="text-center hover:border-gold-500/30 transition-colors duration-300"
            >
              <CardBody className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-display font-semibold text-cream-100 mb-3">
                  {advantage.title}
                </h3>
                <p className="text-cream-300 leading-relaxed">
                  {advantage.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
