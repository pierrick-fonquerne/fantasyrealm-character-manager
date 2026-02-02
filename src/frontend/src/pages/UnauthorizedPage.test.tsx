import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import UnauthorizedPage from './UnauthorizedPage';

expect.extend(toHaveNoViolations);

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const renderPage = () => {
  return render(
    <MemoryRouter>
      <UnauthorizedPage />
    </MemoryRouter>
  );
};

describe('UnauthorizedPage', () => {
  it('should render the unauthorized heading', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: /accès non autorisé/i })).toBeInTheDocument();
  });

  it('should render explanatory message', () => {
    renderPage();

    expect(screen.getByText(/vous n'avez pas les permissions/i)).toBeInTheDocument();
  });

  it('should render a link back to home', () => {
    renderPage();

    const link = screen.getByRole('link', { name: /retour à l'accueil/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('should render skip link for accessibility', () => {
    renderPage();

    const skipLink = screen.getByText(/aller au contenu principal/i);
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have main content landmark', () => {
    renderPage();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
