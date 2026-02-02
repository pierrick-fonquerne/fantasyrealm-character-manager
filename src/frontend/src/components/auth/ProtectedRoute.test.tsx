import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

let mockAuthState = {
  isAuthenticated: true,
  user: { id: 1, email: 'test@example.com', pseudo: 'TestUser', role: 'User' },
  token: 'fake-token',
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

const renderWithRoute = (requiredRole?: 'User' | 'Employee' | 'Admin') => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Contenu protégé</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Page de connexion</div>} />
        <Route path="/unauthorized" element={<div>Accès non autorisé</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com', pseudo: 'TestUser', role: 'User' },
      token: 'fake-token',
      login: vi.fn(),
      logout: vi.fn(),
    };
  });

  it('should redirect to /login when not authenticated', () => {
    mockAuthState = { ...mockAuthState, isAuthenticated: false, user: null as typeof mockAuthState.user | null } as typeof mockAuthState;

    renderWithRoute('User');

    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('should redirect to /unauthorized when role is insufficient', () => {
    mockAuthState = { ...mockAuthState, user: { ...mockAuthState.user, role: 'User' } };

    renderWithRoute('Employee');

    expect(screen.getByText('Accès non autorisé')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('should render children when role is sufficient', () => {
    renderWithRoute('User');

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('should render children when no role is required', () => {
    renderWithRoute();

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('should allow Admin to access Employee-required route', () => {
    mockAuthState = { ...mockAuthState, user: { ...mockAuthState.user, role: 'Admin' } };

    renderWithRoute('Employee');

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('should allow Admin to access User-required route', () => {
    mockAuthState = { ...mockAuthState, user: { ...mockAuthState.user, role: 'Admin' } };

    renderWithRoute('User');

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('should allow Employee to access User-required route', () => {
    mockAuthState = { ...mockAuthState, user: { ...mockAuthState.user, role: 'Employee' } };

    renderWithRoute('User');

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('should not allow Employee to access Admin-required route', () => {
    mockAuthState = { ...mockAuthState, user: { ...mockAuthState.user, role: 'Employee' } };

    renderWithRoute('Admin');

    expect(screen.getByText('Accès non autorisé')).toBeInTheDocument();
  });
});
