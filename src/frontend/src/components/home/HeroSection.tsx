import { Button } from '../ui';

const HeroSection = () => {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900" />
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-cream-100 mb-6 leading-tight">
              Forgez votre héros{' '}
              <span className="text-gold-400">légendaire</span>
            </h1>

            <p className="text-lg text-cream-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Créez, personnalisez et gérez vos personnages dans FantasyRealm Online.
              Équipez-les, partagez-les avec la communauté et forgez votre légende.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg">
                Créer un personnage
              </Button>
              <Button variant="outline" size="lg">
                Explorer la galerie
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="aspect-[3/4] bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
              <img
                src="/assets/images/hero.jpg"
                alt="Héros légendaire de FantasyRealm Online"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold-500/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
