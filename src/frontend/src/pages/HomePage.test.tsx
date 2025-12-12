import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HomePage from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<HomePage />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders the Header component', () => {
    render(<HomePage />);
    const logos = screen.getAllByText('FantasyRealm');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders the HeroSection with main title', () => {
    render(<HomePage />);
    expect(screen.getByText(/Forgez votre héros/)).toBeInTheDocument();
    expect(screen.getByText('légendaire')).toBeInTheDocument();
  });

  it('renders the hero badge', () => {
    render(<HomePage />);
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
  });

  it('renders hero statistics', () => {
    render(<HomePage />);
    expect(screen.getByText('12K+')).toBeInTheDocument();
    expect(screen.getByText('5K+')).toBeInTheDocument();
  });

  it('renders the FeaturesSection', () => {
    render(<HomePage />);
    expect(screen.getByText('Personnalisation avancée')).toBeInTheDocument();
    expect(screen.getByText('Partagez vos créations')).toBeInTheDocument();
    expect(screen.getByText('Équipements variés')).toBeInTheDocument();
  });

  it('renders the PopularHeroesSection', () => {
    render(<HomePage />);
    expect(screen.getByText('populaires')).toBeInTheDocument();
  });

  it('renders the AboutSection', () => {
    render(<HomePage />);
    expect(screen.getByText(/À propos de/)).toBeInTheDocument();
  });

  it('renders the CtaSection', () => {
    render(<HomePage />);
    expect(screen.getByText(/Prêt à/)).toBeInTheDocument();
    expect(screen.getByText('créer')).toBeInTheDocument();
  });

  it('renders the Footer component', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/PixelVerse Studios. Tous droits réservés./)
    ).toBeInTheDocument();
  });

  it('has correct page structure with main element', () => {
    render(<HomePage />);
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<HomePage />);
    expect(screen.getByText('Créer un personnage')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
  });
});
