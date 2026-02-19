import { useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'fantasyrealm_cookie_dismissed';

const CookieBanner = () => {
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  if (isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Information sur les cookies et le stockage local"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-700 bg-dark-900/95 backdrop-blur-sm px-4 py-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-cream-300 flex-1">
          Ce site n'utilise aucun cookie de traçage ou publicitaire. Seul un
          jeton d'authentification est stocké dans votre navigateur pour
          maintenir votre session.{' '}
          <Link
            to="/politique-de-confidentialite"
            className="text-gold-400 hover:text-gold-300 underline transition-colors"
          >
            En savoir plus
          </Link>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 px-4 py-2 bg-gold-500 text-dark-950 text-sm font-semibold rounded-lg hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-900 transition-colors cursor-pointer"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
