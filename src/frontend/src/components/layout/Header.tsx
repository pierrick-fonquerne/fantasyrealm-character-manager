import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Galerie', href: '/galerie' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const getInitial = (pseudo: string | undefined): string => {
    return pseudo ? pseudo.charAt(0).toUpperCase() : '?';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-900/95 backdrop-blur-sm border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/assets/logos/fantasyrealm-logo-transparent.png"
              alt="FantasyRealm"
              className="h-14 w-auto"
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-gold-500 bg-dark-800'
                    : 'text-cream-300 hover:text-cream-100 hover:bg-dark-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Menu utilisateur"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-dark-950 font-semibold text-sm hover:shadow-lg hover:shadow-gold-500/25 transition-all duration-200 cursor-pointer"
                >
                  {getInitial(user?.pseudo)}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-dark-700">
                      <p className="text-sm font-medium text-cream-200">{user?.pseudo}</p>
                      <p className="text-xs text-cream-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profil"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-cream-300 hover:bg-dark-700 hover:text-cream-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mon profil
                    </Link>
                    <Link
                      to="/parametres"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-cream-300 hover:bg-dark-700 hover:text-cream-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Paramètres
                    </Link>
                    {(user?.role === 'Employee' || user?.role === 'Admin') && (
                      <Link
                        to="/moderation"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-cream-300 hover:bg-dark-700 hover:text-cream-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Modération
                      </Link>
                    )}
                    {user?.role === 'Admin' && (
                      <Link
                        to="/administration"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-cream-300 hover:bg-dark-700 hover:text-cream-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Administration
                      </Link>
                    )}
                    <div className="border-t border-dark-700 my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-700 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Inscription
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Menu Burger Mobile */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="md:hidden p-2 rounded-lg text-cream-300 hover:text-cream-100 hover:bg-dark-800 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-dark-700 bg-dark-900 animate-slide-down">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-gold-500 bg-dark-800'
                    : 'text-cream-300 hover:text-cream-100 hover:bg-dark-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-dark-700 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-dark-950 font-semibold text-sm">
                      {getInitial(user?.pseudo)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cream-200">{user?.pseudo}</p>
                      <p className="text-xs text-cream-400">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profil"
                    className="px-4 py-2 text-sm text-cream-300 hover:bg-dark-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/parametres"
                    className="px-4 py-2 text-sm text-cream-300 hover:bg-dark-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Paramètres
                  </Link>
                  {(user?.role === 'Employee' || user?.role === 'Admin') && (
                    <Link
                      to="/moderation"
                      className="px-4 py-2 text-sm text-cream-300 hover:bg-dark-800 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Modération
                    </Link>
                  )}
                  {user?.role === 'Admin' && (
                    <Link
                      to="/administration"
                      className="px-4 py-2 text-sm text-cream-300 hover:bg-dark-800 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-dark-800 rounded-lg transition-colors text-left"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>
                      Inscription
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>
                      Connexion
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
