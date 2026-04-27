import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { LoginForm } from '../components/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === 'true';

  const handleSuccess = () => {
    navigate('/dashboard');
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
            {sessionExpired && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-lg flex items-start gap-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <div>
                  <p className="text-amber-200 font-medium">Votre session a expiré.</p>
                  <p className="text-amber-300/80 text-sm">Veuillez vous reconnecter.</p>
                </div>
              </div>
            )}

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
