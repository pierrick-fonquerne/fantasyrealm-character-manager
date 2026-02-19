import { useState, type FormEvent } from 'react';
import { Header, Footer } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import type { ApiError } from '../services/api';

interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isLong: boolean;
}

function evaluatePassword(password: string): { criteria: PasswordCriteria; score: number } {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{}|;:',.<>?/\\]/.test(password),
    isLong: password.length >= 16,
  };

  let score = 0;
  if (criteria.minLength) score++;
  if (criteria.isLong) score++;
  if (criteria.hasUppercase) score++;
  if (criteria.hasLowercase) score++;
  if (criteria.hasDigit) score++;
  if (criteria.hasSpecial) score++;

  return { criteria, score };
}

function getStrengthLabel(score: number): { label: string; color: string; barColor: string } {
  if (score <= 2) return { label: 'Faible', color: 'text-red-400', barColor: 'bg-red-500' };
  if (score <= 3) return { label: 'Moyen', color: 'text-orange-400', barColor: 'bg-orange-500' };
  if (score <= 4) return { label: 'Bon', color: 'text-amber-400', barColor: 'bg-amber-500' };
  if (score === 5) return { label: 'Fort', color: 'text-green-400', barColor: 'bg-green-500' };
  return { label: 'Excellent', color: 'text-emerald-400', barColor: 'bg-emerald-500' };
}

const CRITERIA_LABELS: { key: keyof PasswordCriteria; label: string }[] = [
  { key: 'minLength', label: '12 caractères minimum' },
  { key: 'hasUppercase', label: 'Une lettre majuscule' },
  { key: 'hasLowercase', label: 'Une lettre minuscule' },
  { key: 'hasDigit', label: 'Un chiffre' },
  { key: 'hasSpecial', label: 'Un caractère spécial' },
];

const SettingsPage = () => {
  const { token, login } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { criteria, score } = evaluatePassword(newPassword);
  const strength = getStrengthLabel(score);

  const isPasswordValid =
    criteria.minLength &&
    criteria.hasUppercase &&
    criteria.hasLowercase &&
    criteria.hasDigit &&
    criteria.hasSpecial;

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    isPasswordValid &&
    passwordsMatch &&
    !isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await authService.changePassword(
        {
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        },
        token!,
      );

      login({
        token: response.token,
        expiresAt: response.expiresAt,
        user: response.user,
        mustChangePassword: false,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Votre mot de passe a été modifié avec succès.');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
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

      <main id="main-content" role="main" className="flex-1">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-cream-100 text-center mb-10">
              Paramètres
            </h1>

            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-cream-100 mb-6">
                Modifier le mot de passe
              </h2>

              {success && (
                <div
                  className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                  role="status"
                >
                  {success}
                </div>
              )}

              {error && (
                <div
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-cream-300 mb-1.5"
                  >
                    Mot de passe actuel
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-cream-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
                    placeholder="Votre mot de passe actuel"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-cream-300 mb-1.5"
                  >
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-cream-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
                    placeholder="Votre nouveau mot de passe"
                    required
                  />

                  {newPassword.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strength.barColor}`}
                            style={{ width: `${(score / 6) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${strength.color}`}>
                          {strength.label}
                        </span>
                      </div>

                      <ul className="space-y-1" aria-label="Critères du mot de passe">
                        {CRITERIA_LABELS.map(({ key, label }) => (
                          <li
                            key={key}
                            className={`flex items-center gap-2 text-xs ${
                              criteria[key] ? 'text-green-400' : 'text-dark-400'
                            }`}
                          >
                            {criteria[key] ? (
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="4" />
                              </svg>
                            )}
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-cream-300 mb-1.5"
                  >
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-cream-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-red-400">
                      Les mots de passe ne correspondent pas.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-2.5 px-4 bg-gold-500 text-dark-950 font-semibold rounded-lg hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Modification en cours...' : 'Modifier le mot de passe'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
