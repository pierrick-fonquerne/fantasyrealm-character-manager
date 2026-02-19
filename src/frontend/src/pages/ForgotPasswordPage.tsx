import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { ForgotPasswordForm } from '../components/auth';
import { Alert } from '../components/ui';

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccess = () => {
    setIsSuccess(true);
  };

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
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-gold-500 mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-cream-300">
              Récupérez l'accès à votre compte
            </p>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 md:p-8">
            {isSuccess ? (
              <div>
                <Alert variant="success" className="mb-6">
                  Un nouveau mot de passe a été envoyé à votre adresse email.
                </Alert>
                <p className="text-cream-300 text-sm mb-6">
                  Vérifiez votre boîte de réception et utilisez le mot de passe temporaire pour vous connecter.
                  Vous serez invité à le changer lors de votre prochaine connexion.
                </p>
                <Link
                  to="/login"
                  className="block w-full text-center bg-gold-500 hover:bg-gold-400 text-dark-950 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <ForgotPasswordForm onSuccess={handleSuccess} />
            )}

            {!isSuccess && (
              <div className="mt-6 pt-6 border-t border-dark-700 text-center">
                <p className="text-cream-400 text-sm">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link
                    to="/login"
                    className="text-gold-500 hover:text-gold-400 font-medium"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
