import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminStats } from '../services/adminService';
import type { AdminStats } from '../types/admin';
import { Header, Footer } from '../components/layout';
import { AdminDashboardStats } from '../components/admin';
import { Alert } from '../components/ui';
import { Tabs, TabsList, Tab, TabsPanel } from '../components/ui/Tabs/Tabs';

export default function AdminPage() {
  const { token } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setError(null);
    setIsLoading(true);
    try {
      const data = await getAdminStats(token);
      setStats(data);
    } catch {
      setError('Impossible de charger les statistiques.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-display text-gold-300">
              Administration
            </h1>
            <p className="mt-2 text-cream-400">
              Tableau de bord et gestion de la plateforme.
            </p>
          </div>

          <Tabs defaultTab="overview">
            <TabsList className="mb-6">
              <Tab value="overview">Vue d'ensemble</Tab>
              <Tab value="employees">Employés</Tab>
              <Tab value="logs">Logs d'activité</Tab>
            </TabsList>

            {/* ── Overview Panel ──────────────────────────────────── */}
            <TabsPanel value="overview">
              {error && (
                <Alert variant="error" className="mb-6">
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={fetchStats}
                      className="ml-4 text-sm font-medium underline hover:no-underline"
                    >
                      Réessayer
                    </button>
                  </div>
                </Alert>
              )}

              <AdminDashboardStats stats={stats} isLoading={isLoading} />

              {!isLoading && !error && (
                <div className="mt-8 p-6 bg-dark-800 border border-dark-700 rounded-xl">
                  <h2 className="text-lg font-semibold text-cream-100 mb-3">
                    Accès rapide
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/moderation"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 text-gold-300 rounded-lg hover:bg-gold-500/20 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Espace modération
                    </Link>
                  </div>
                </div>
              )}
            </TabsPanel>

            {/* ── Employees Panel ─────────────────────────────────── */}
            <TabsPanel value="employees">
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-cream-500 text-lg mb-2">Gestion des employés</p>
                <p className="text-cream-600 text-sm">Cette fonctionnalité sera bientôt disponible.</p>
              </div>
            </TabsPanel>

            {/* ── Logs Panel ──────────────────────────────────────── */}
            <TabsPanel value="logs">
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-cream-500 text-lg mb-2">Logs d'activité</p>
                <p className="text-cream-600 text-sm">Cette fonctionnalité sera bientôt disponible.</p>
              </div>
            </TabsPanel>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
