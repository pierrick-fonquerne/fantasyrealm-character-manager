import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { RegisterForm } from '../components/auth';

const RegisterPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);

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
        <div className="w-full max-w-md">
          {isSuccess ? (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-2xl text-cream-100 mb-4">
                Inscription réussie !
              </h1>
              <p className="text-cream-300 mb-6">
                Bienvenue dans FantasyRealm ! Un email de confirmation vous a été envoyé.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-dark-950 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl md:text-4xl text-gold-500 mb-2">
                  Créer un compte
                </h1>
                <p className="text-cream-300">
                  Rejoignez la communauté FantasyRealm
                </p>
              </div>

              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 md:p-8">
                <RegisterForm onSuccess={() => setIsSuccess(true)} />

                <div className="mt-6 pt-6 border-t border-dark-700 text-center">
                  <p className="text-cream-400 text-sm">
                    Déjà un compte ?{' '}
                    <Link
                      to="/login"
                      className="text-gold-500 hover:text-gold-400 font-medium"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
