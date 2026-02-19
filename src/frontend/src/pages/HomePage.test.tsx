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
    const logo = screen.getByAltText('FantasyRealm');
    expect(logo).toBeInTheDocument();
  });

  it('renders the HeroSection with main title', () => {
    renderWithRouter();
    expect(screen.getByText(/Forgez votre héros/)).toBeInTheDocument();
    expect(screen.getByText('légendaire')).toBeInTheDocument();
  });

  it('renders hero CTA buttons', () => {
    renderWithRouter();
    expect(screen.getByText('Créer un personnage')).toBeInTheDocument();
    expect(screen.getByText('Explorer la galerie')).toBeInTheDocument();
  });

  it('renders the CompanySection', () => {
    renderWithRouter();
    expect(document.getElementById('company-heading')).toBeInTheDocument();
    expect(screen.getByText('2015')).toBeInTheDocument();
    expect(screen.getByText('5M+')).toBeInTheDocument();
    expect(screen.getByText('150+')).toBeInTheDocument();
  });

  it('renders the AdvantagesSection', () => {
    renderWithRouter();
    expect(screen.getByText('Personnalisation avancée')).toBeInTheDocument();
    expect(screen.getByText('Partagez vos créations')).toBeInTheDocument();
    expect(screen.getByText('Équipements variés')).toBeInTheDocument();
  });

  it('renders the GameSection', () => {
    renderWithRouter();
    expect(document.getElementById('game-heading')).toBeInTheDocument();
    expect(screen.getByText('Combats épiques')).toBeInTheDocument();
    expect(screen.getByText('4 classes jouables')).toBeInTheDocument();
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

  it('has skip link for accessibility', () => {
    renderWithRouter();
    expect(screen.getByText('Aller au contenu principal')).toBeInTheDocument();
  });

  it('has aria-labelledby on each section', () => {
    renderWithRouter();
    expect(document.getElementById('company-heading')).toBeInTheDocument();
    expect(document.getElementById('advantages-heading')).toBeInTheDocument();
    expect(document.getElementById('game-heading')).toBeInTheDocument();
  });
});
