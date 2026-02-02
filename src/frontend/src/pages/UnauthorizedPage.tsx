import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="main-content" role="main" className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="font-display text-3xl md:text-4xl text-gold-500 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-cream-300 text-lg mb-8">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gold-500 text-dark-950 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnauthorizedPage;
