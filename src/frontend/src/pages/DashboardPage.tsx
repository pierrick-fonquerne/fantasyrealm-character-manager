import { Navigate } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
            Bienvenue, <span className="text-cream-100">{user?.pseudo}</span>
          </h1>
          <p className="text-cream-300 text-lg mb-8">
            Votre espace personnel FantasyRealm
          </p>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-cream-400">
              Cette section est en cours de construction.
              Bientôt, vous pourrez gérer vos personnages et accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
