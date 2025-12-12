import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('FantasyRealm')).toBeInTheDocument();
  });

  it('renders the brand description', () => {
    render(<Footer />);
    expect(
      screen.getByText(/Créez et personnalisez vos héros légendaires/)
    ).toBeInTheDocument();
  });

  it('renders left footer links', () => {
    render(<Footer />);
    expect(screen.getByText('À propos')).toBeInTheDocument();
    expect(screen.getByText('CGU')).toBeInTheDocument();
    expect(screen.getByText('Accessibilité')).toBeInTheDocument();
  });

  it('renders right footer links', () => {
    render(<Footer />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Confidentialité')).toBeInTheDocument();
    expect(screen.getByText('Aide')).toBeInTheDocument();
  });

  it('renders social media links with correct aria-labels', () => {
    render(<Footer />);
    expect(screen.getByLabelText('X (Twitter)')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('social links open in new tab', () => {
    render(<Footer />);
    const twitterLink = screen.getByLabelText('X (Twitter)');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders copyright with current year', () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2025 PixelVerse Studios. Tous droits réservés./)
    ).toBeInTheDocument();
  });

  it('has correct hrefs for footer links', () => {
    render(<Footer />);
    expect(screen.getByText('À propos')).toHaveAttribute('href', '/a-propos');
    expect(screen.getByText('CGU')).toHaveAttribute('href', '/cgu');
    expect(screen.getByText('Contact')).toHaveAttribute('href', '/contact');
  });

  it('brand logo links to homepage', () => {
    render(<Footer />);
    const brandLink = screen.getByText('FantasyRealm');
    expect(brandLink).toHaveAttribute('href', '/');
  });
});
