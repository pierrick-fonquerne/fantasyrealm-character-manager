import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header', () => {
  it('renders the logo with correct text', () => {
    render(<Header />);
    expect(screen.getByText('FantasyRealm')).toBeInTheDocument();
  });

  it('renders navigation links on desktop', () => {
    render(<Header />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Galerie')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders the login button', () => {
    render(<Header />);
    const loginButtons = screen.getAllByText('Connexion');
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it('renders burger menu button for mobile', () => {
    render(<Header />);
    const burgerButton = screen.getByLabelText('Ouvrir le menu');
    expect(burgerButton).toBeInTheDocument();
  });

  it('toggles mobile menu when burger button is clicked', () => {
    render(<Header />);
    const burgerButton = screen.getByLabelText('Ouvrir le menu');

    fireEvent.click(burgerButton);

    expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();
  });

  it('has correct href for logo', () => {
    render(<Header />);
    const logo = screen.getByText('FantasyRealm');
    expect(logo).toHaveAttribute('href', '/');
  });

  it('has correct hrefs for navigation links', () => {
    render(<Header />);
    const accueilLinks = screen.getAllByText('Accueil');
    const galerieLinks = screen.getAllByText('Galerie');
    const contactLinks = screen.getAllByText('Contact');

    expect(accueilLinks[0]).toHaveAttribute('href', '/');
    expect(galerieLinks[0]).toHaveAttribute('href', '/galerie');
    expect(contactLinks[0]).toHaveAttribute('href', '/contact');
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Header />);
    const burgerButton = screen.getByLabelText('Ouvrir le menu');

    fireEvent.click(burgerButton);
    expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();

    const mobileLinks = screen.getAllByText('Accueil');
    const mobileLink = mobileLinks[mobileLinks.length - 1];
    fireEvent.click(mobileLink);

    expect(screen.getByLabelText('Ouvrir le menu')).toBeInTheDocument();
  });
});
