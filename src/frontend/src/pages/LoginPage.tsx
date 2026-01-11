import { useNavigate, Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { LoginForm } from '../components/auth';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
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
              Connexion
            </h1>
            <p className="text-cream-300">
              Accédez à votre espace FantasyRealm
            </p>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 md:p-8">
            <LoginForm onSuccess={handleSuccess} />

            <div className="mt-6 pt-6 border-t border-dark-700 text-center">
              <p className="text-cream-400 text-sm">
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  className="text-gold-500 hover:text-gold-400 font-medium"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
