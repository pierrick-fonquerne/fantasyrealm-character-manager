import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks';
import { getAdminStats } from '../services/adminService';
import {
  getEmployees,
  getEmployeesCount,
  createEmployee,
  suspendEmployee,
  reactivateEmployee,
  resetEmployeePassword,
  deleteEmployee,
} from '../services/adminEmployeeService';
import { getLogs } from '../services/adminActivityLogService';
import type { AdminStats, EmployeeManagement, ActivityLog, ActivityAction } from '../types/admin';
import type { PagedResponse } from '../types/common';
import { Header, Footer } from '../components/layout';
import {
  ActivityLogFilters,
  ActivityLogTable,
  AdminDashboardStats,
  CreateEmployeeModal,
  EmployeeCard,
  ResetPasswordModal,
} from '../components/admin';
import { SuspendReasonModal, ConfirmDeleteModal } from '../components/moderation';
import { Alert, Pagination } from '../components/ui';
import { Tabs, TabsList, Tab, TabsPanel } from '../components/ui/Tabs/Tabs';

export default function AdminPage() {
  const { token } = useAuth();

  // ── Stats state ──────────────────────────────────────────────────
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setStatsError(null);
    setStatsLoading(true);
    try {
      const data = await getAdminStats(token);
      setStats(data);
    } catch {
      setStatsError('Impossible de charger les statistiques.');
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Employees state ──────────────────────────────────────────────
  const [empData, setEmpData] = useState<PagedResponse<EmployeeManagement> | null>(null);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState<string | null>(null);
  const [empPage, setEmpPage] = useState(1);
  const [empSearch, setEmpSearch] = useState('');
  const debouncedEmpSearch = useDebounce(empSearch, 300);
  const [empFilter, setEmpFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [empProcessingId, setEmpProcessingId] = useState<number | null>(null);
  const [empCount, setEmpCount] = useState(0);
  const empRequestIdRef = useRef(0);

  const employees = empData?.items ?? [];
  const empTotalPages = empData?.totalPages ?? 0;

  const isSuspendedFilter = empFilter === 'all' ? null : empFilter === 'suspended';

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    const currentRequestId = ++empRequestIdRef.current;
    setEmpError(null);
    setEmpLoading(true);
    try {
      const result = await getEmployees(empPage, debouncedEmpSearch, isSuspendedFilter, token);
      if (currentRequestId !== empRequestIdRef.current) return;
      setEmpData(result);
    } catch {
      if (currentRequestId !== empRequestIdRef.current) return;
      setEmpError('Impossible de charger les employés.');
    } finally {
      if (currentRequestId === empRequestIdRef.current) {
        setEmpLoading(false);
      }
    }
  }, [empPage, debouncedEmpSearch, isSuspendedFilter, token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const fetchEmployeesCount = useCallback(async () => {
    if (!token) return;
    try {
      const count = await getEmployeesCount(token);
      setEmpCount(count);
    } catch {
      // Silently fail for count
    }
  }, [token]);

  useEffect(() => {
    fetchEmployeesCount();
  }, [fetchEmployeesCount]);

  // ── Create modal ───────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateConfirm = async (email: string, password: string) => {
    if (!token) return;
    setIsCreating(true);
    setEmpError(null);
    try {
      await createEmployee(email, password, token);
      setShowCreateModal(false);
      setEmpCount((prev) => prev + 1);
      await fetchEmployees();
      await fetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création de l'employé.";
      setEmpError(message);
    } finally {
      setIsCreating(false);
    }
  };

  // ── Suspend modal ──────────────────────────────────────────────
  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    id: number | null;
    targetName: string;
  }>({ isOpen: false, id: null, targetName: '' });
  const [isSuspending, setIsSuspending] = useState(false);
  const suspendKeyRef = useRef(0);

  const handleSuspendOpen = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    suspendKeyRef.current += 1;
    setSuspendModal({ isOpen: true, id, targetName: emp?.pseudo ?? '' });
  };

  const handleSuspendClose = () => {
    setSuspendModal({ isOpen: false, id: null, targetName: '' });
  };

  const handleSuspendConfirm = async (reason: string) => {
    if (!token || suspendModal.id === null) return;
    setIsSuspending(true);
    setEmpError(null);
    try {
      await suspendEmployee(suspendModal.id, reason, token);
      handleSuspendClose();
      await fetchEmployees();
    } catch {
      setEmpError('Erreur lors de la suspension du compte.');
    } finally {
      setIsSuspending(false);
    }
  };

  // ── Reactivate ─────────────────────────────────────────────────
  const handleReactivate = async (id: number) => {
    if (!token) return;
    setEmpProcessingId(id);
    setEmpError(null);
    try {
      await reactivateEmployee(id, token);
      await fetchEmployees();
    } catch {
      setEmpError('Erreur lors de la réactivation du compte.');
    } finally {
      setEmpProcessingId(null);
    }
  };

  // ── Reset password modal ──────────────────────────────────────
  const [resetPwdModal, setResetPwdModal] = useState<{
    isOpen: boolean;
    id: number | null;
    targetName: string;
  }>({ isOpen: false, id: null, targetName: '' });
  const [isResettingPwd, setIsResettingPwd] = useState(false);
  const [resetPwdResult, setResetPwdResult] = useState<'idle' | 'success' | 'error'>('idle');

  const handleResetPasswordOpen = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    setResetPwdResult('idle');
    setResetPwdModal({ isOpen: true, id, targetName: emp?.pseudo ?? '' });
  };

  const handleResetPasswordClose = () => {
    setResetPwdModal({ isOpen: false, id: null, targetName: '' });
    setResetPwdResult('idle');
  };

  const handleResetPasswordConfirm = async () => {
    if (!token || resetPwdModal.id === null) return;
    setIsResettingPwd(true);
    try {
      await resetEmployeePassword(resetPwdModal.id, token);
      setResetPwdResult('success');
    } catch {
      setResetPwdResult('error');
    } finally {
      setIsResettingPwd(false);
    }
  };

  // ── Delete modal ───────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    targetName: string;
  }>({ isOpen: false, id: null, targetName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteOpen = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    setDeleteModal({ isOpen: true, id, targetName: emp?.pseudo ?? '' });
  };

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, id: null, targetName: '' });
  };

  const handleDeleteConfirm = async () => {
    if (!token || deleteModal.id === null) return;
    setIsDeleting(true);
    setEmpError(null);
    try {
      await deleteEmployee(deleteModal.id, token);
      setEmpData((prev) => {
        if (!prev) return prev;
        const filtered = prev.items.filter((e) => e.id !== deleteModal.id);
        return { ...prev, items: filtered, totalCount: prev.totalCount - 1 };
      });
      setEmpCount((prev) => Math.max(0, prev - 1));
      handleDeleteClose();
      await fetchStats();
    } catch {
      setEmpError('Erreur lors de la suppression du compte.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Auto-fallback to previous page when empty ──────────────────
  useEffect(() => {
    if (!empLoading && empData && empData.items.length === 0 && empPage > 1) {
      setEmpPage(empPage - 1);
    }
  }, [empData, empLoading, empPage]);

  // ── Reset page on search/filter change ─────────────────────────
  useEffect(() => {
    setEmpPage(1);
  }, [debouncedEmpSearch, empFilter]);

  // ── Activity logs state ──────────────────────────────────────────
  const [logData, setLogData] = useState<PagedResponse<ActivityLog> | null>(null);
  const [logLoading, setLogLoading] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);
  const [logPage, setLogPage] = useState(1);
  const [logAction, setLogAction] = useState<ActivityAction | null>(null);
  const [logFrom, setLogFrom] = useState('');
  const [logTo, setLogTo] = useState('');
  const logRequestIdRef = useRef(0);

  const logItems = logData?.items ?? [];
  const logTotalPages = logData?.totalPages ?? 0;

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    const currentRequestId = ++logRequestIdRef.current;
    setLogError(null);
    setLogLoading(true);
    try {
      const result = await getLogs(
        logPage, 20, logAction, logFrom || null, logTo || null, token
      );
      if (currentRequestId !== logRequestIdRef.current) return;
      setLogData(result);
    } catch {
      if (currentRequestId !== logRequestIdRef.current) return;
      setLogError("Impossible de charger les logs d'activité.");
    } finally {
      if (currentRequestId === logRequestIdRef.current) {
        setLogLoading(false);
      }
    }
  }, [logPage, logAction, logFrom, logTo, token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setLogPage(1);
  }, [logAction, logFrom, logTo]);

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
              <Tab
                value="employees"
                badge={
                  !empLoading && empCount > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full bg-dark-600 text-cream-300">
                      {empCount}
                    </span>
                  ) : undefined
                }
              >
                Employés
              </Tab>
              <Tab value="logs">Logs d'activité</Tab>
            </TabsList>

            {/* ── Overview Panel ──────────────────────────────────── */}
            <TabsPanel value="overview">
              {statsError && (
                <Alert variant="error" className="mb-6">
                  <div className="flex items-center justify-between">
                    <span>{statsError}</span>
                    <button
                      type="button"
                      onClick={fetchStats}
                      className="ml-4 text-sm font-medium underline hover:no-underline cursor-pointer"
                    >
                      Réessayer
                    </button>
                  </div>
                </Alert>
              )}

              <AdminDashboardStats stats={stats} isLoading={statsLoading} />

              {!statsLoading && !statsError && (
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
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Rechercher par pseudo ou email…"
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 placeholder-cream-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                    aria-label="Rechercher un employé"
                  />
                </div>
                <select
                  value={empFilter}
                  onChange={(e) => setEmpFilter(e.target.value as 'all' | 'active' | 'suspended')}
                  className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm cursor-pointer"
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="suspended">Suspendus</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-dark-950 rounded-lg hover:bg-gold-400 transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer un employé
                </button>
              </div>

              {empError && (
                <Alert variant="error" className="mb-6">
                  <div className="flex items-center justify-between">
                    <span>{empError}</span>
                    <button
                      type="button"
                      onClick={fetchEmployees}
                      className="ml-4 text-sm font-medium underline hover:no-underline cursor-pointer"
                    >
                      Réessayer
                    </button>
                  </div>
                </Alert>
              )}

              {empLoading && (
                <div className="flex justify-center py-20" role="status" aria-label="Chargement">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
                </div>
              )}

              {!empLoading && !empError && employees.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-cream-500 text-lg">
                    {empSearch || empFilter !== 'all'
                      ? 'Aucun employé ne correspond à votre recherche.'
                      : 'Aucun employé enregistré.'}
                  </p>
                </div>
              )}

              {!empLoading && !empError && employees.length > 0 && (
                <ul
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 list-none p-0 m-0"
                  aria-label="Liste des employés"
                >
                  {employees.map((emp) => (
                    <li key={emp.id}>
                      <EmployeeCard
                        employee={emp}
                        onSuspend={handleSuspendOpen}
                        onReactivate={handleReactivate}
                        onResetPassword={handleResetPasswordOpen}
                        onDelete={handleDeleteOpen}
                        isProcessing={empProcessingId === emp.id}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {empTotalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={empPage}
                    totalPages={empTotalPages}
                    onChange={setEmpPage}
                  />
                </div>
              )}
            </TabsPanel>

            {/* ── Logs Panel ──────────────────────────────────────── */}
            <TabsPanel value="logs">
              <ActivityLogFilters
                action={logAction}
                from={logFrom}
                to={logTo}
                isLoading={logLoading}
                onActionChange={setLogAction}
                onFromChange={setLogFrom}
                onToChange={setLogTo}
                onRefresh={fetchLogs}
              />

              {logError && (
                <Alert variant="error" className="mb-6">
                  <div className="flex items-center justify-between">
                    <span>{logError}</span>
                    <button
                      type="button"
                      onClick={fetchLogs}
                      className="ml-4 text-sm font-medium underline hover:no-underline cursor-pointer"
                    >
                      Réessayer
                    </button>
                  </div>
                </Alert>
              )}

              {logLoading && (
                <div className="flex justify-center py-20" role="status" aria-label="Chargement">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
                </div>
              )}

              {!logLoading && !logError && logItems.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-cream-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-cream-500 text-lg">
                    {logAction || logFrom || logTo
                      ? "Aucun log ne correspond aux filtres sélectionnés."
                      : "Aucun log d'activité enregistré."}
                  </p>
                </div>
              )}

              {!logLoading && !logError && logItems.length > 0 && (
                <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                  <ActivityLogTable logs={logItems} />
                </div>
              )}

              {logTotalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={logPage}
                    totalPages={logTotalPages}
                    onChange={setLogPage}
                  />
                </div>
              )}
            </TabsPanel>
          </Tabs>
        </div>
      </main>

      <Footer />

      <CreateEmployeeModal
        isOpen={showCreateModal}
        onConfirm={handleCreateConfirm}
        onClose={() => setShowCreateModal(false)}
        isSubmitting={isCreating}
      />

      <SuspendReasonModal
        key={`suspend-${suspendKeyRef.current}`}
        isOpen={suspendModal.isOpen}
        targetName={suspendModal.targetName}
        onConfirm={handleSuspendConfirm}
        onClose={handleSuspendClose}
        isSubmitting={isSuspending}
      />

      <ConfirmDeleteModal
        key={`delete-${deleteModal.id}`}
        isOpen={deleteModal.isOpen}
        targetName={deleteModal.targetName}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteClose}
        isSubmitting={isDeleting}
      />

      <ResetPasswordModal
        key={`reset-pwd-${resetPwdModal.id}`}
        isOpen={resetPwdModal.isOpen}
        targetName={resetPwdModal.targetName}
        onConfirm={handleResetPasswordConfirm}
        onClose={handleResetPasswordClose}
        isSubmitting={isResettingPwd}
        result={resetPwdResult}
      />
    </div>
  );
}
