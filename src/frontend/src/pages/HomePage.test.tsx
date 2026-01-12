import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HomePage from './HomePage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
}));

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    renderWithRouter();
    expect(document.body).toBeInTheDocument();
  });

  it('renders the Header component', () => {
    renderWithRouter();
    const logos = screen.getAllByText('FantasyRealm');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders the HeroSection with main title', () => {
    renderWithRouter();
    expect(screen.getByText(/Forgez votre héros/)).toBeInTheDocument();
    expect(screen.getByText('légendaire')).toBeInTheDocument();
  });

  it('renders the hero badge', () => {
    renderWithRouter();
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
  });

  it('renders hero statistics', () => {
    renderWithRouter();
    expect(screen.getByText('12K+')).toBeInTheDocument();
    expect(screen.getByText('5K+')).toBeInTheDocument();
  });

  it('renders the FeaturesSection', () => {
    renderWithRouter();
    expect(screen.getByText('Personnalisation avancée')).toBeInTheDocument();
    expect(screen.getByText('Partagez vos créations')).toBeInTheDocument();
    expect(screen.getByText('Équipements variés')).toBeInTheDocument();
  });

  it('renders the PopularHeroesSection', () => {
    renderWithRouter();
    expect(screen.getByText('populaires')).toBeInTheDocument();
  });

  it('renders the AboutSection', () => {
    renderWithRouter();
    expect(screen.getByText(/À propos de/)).toBeInTheDocument();
  });

  it('renders the CtaSection', () => {
    renderWithRouter();
    expect(screen.getByText(/Prêt à/)).toBeInTheDocument();
    expect(screen.getByText('créer')).toBeInTheDocument();
  });

  it('renders the Footer component', () => {
    renderWithRouter();
    expect(
      screen.getByText(/PixelVerse Studios. Tous droits réservés./)
    ).toBeInTheDocument();
  });

  it('has correct page structure with main element', () => {
    renderWithRouter();
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    renderWithRouter();
    expect(screen.getByText('Créer un personnage')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
  });
});
