import { Button } from '../ui';

const CtaSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative py-12 lg:py-20 px-6 lg:px-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-cream-100 mb-4">
              Prêt à <span className="text-gold-400">créer</span> ?
            </h2>

            <p className="text-cream-300 max-w-xl mx-auto mb-8">
              Rejoignez des milliers de héros légendaires et créez votre personnage unique dès maintenant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Créer un compte
              </Button>
              <Button variant="outline" size="lg">
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
