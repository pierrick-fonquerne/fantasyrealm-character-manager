import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Footer from './Footer';

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the brand name', () => {
    renderFooter();
    expect(screen.getByText('FantasyRealm')).toBeInTheDocument();
  });

  it('renders the brand description', () => {
    renderFooter();
    expect(
      screen.getByText(/Créez et personnalisez vos héros légendaires/)
    ).toBeInTheDocument();
  });

  it('renders left footer links', () => {
    renderFooter();
    expect(screen.getByText('Mentions légales')).toBeInTheDocument();
    expect(screen.getByText('CGU')).toBeInTheDocument();
  });

  it('renders right footer links', () => {
    renderFooter();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Galerie')).toBeInTheDocument();
  });

  it('renders social media links with correct aria-labels', () => {
    renderFooter();
    expect(screen.getByLabelText('X (Twitter)')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('social links open in new tab', () => {
    renderFooter();
    const twitterLink = screen.getByLabelText('X (Twitter)');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders copyright with current year', () => {
    renderFooter();
    expect(
      screen.getByText(/© 2025 PixelVerse Studios. Tous droits réservés./)
    ).toBeInTheDocument();
  });

  it('has correct hrefs for footer links', () => {
    renderFooter();
    expect(screen.getByText('Mentions légales').closest('a')).toHaveAttribute('href', '/mentions-legales');
    expect(screen.getByText('CGU').closest('a')).toHaveAttribute('href', '/cgu');
    expect(screen.getByText('Contact').closest('a')).toHaveAttribute('href', '/contact');
  });

  it('brand logo links to homepage', () => {
    renderFooter();
    const brandLink = screen.getByText('FantasyRealm').closest('a');
    expect(brandLink).toHaveAttribute('href', '/');
  });
});
