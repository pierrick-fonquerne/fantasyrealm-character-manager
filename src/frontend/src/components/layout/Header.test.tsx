import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Header from './Header';

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Header />
    </MemoryRouter>
  );
};

describe('Header', () => {
  it('renders the logo with correct text', () => {
    renderWithRouter();
    expect(screen.getByText('FantasyRealm')).toBeInTheDocument();
  });

  it('renders navigation links on desktop', () => {
    renderWithRouter();
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Galerie')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders the login button', () => {
    renderWithRouter();
    const loginButtons = screen.getAllByText('Connexion');
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it('renders burger menu button for mobile', () => {
    renderWithRouter();
    const burgerButton = screen.getByLabelText('Ouvrir le menu');
    expect(burgerButton).toBeInTheDocument();
  });

  it('toggles mobile menu when burger button is clicked', () => {
    renderWithRouter();
    const burgerButton = screen.getByLabelText('Ouvrir le menu');

    fireEvent.click(burgerButton);

    expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();
  });

  it('has correct href for logo', () => {
    renderWithRouter();
    const logo = screen.getByText('FantasyRealm');
    expect(logo).toHaveAttribute('href', '/');
  });

  it('has correct hrefs for navigation links', () => {
    renderWithRouter();
    const accueilLinks = screen.getAllByText('Accueil');
    const galerieLinks = screen.getAllByText('Galerie');
    const contactLinks = screen.getAllByText('Contact');

    expect(accueilLinks[0]).toHaveAttribute('href', '/');
    expect(galerieLinks[0]).toHaveAttribute('href', '/galerie');
    expect(contactLinks[0]).toHaveAttribute('href', '/contact');
  });

  it('closes mobile menu when a link is clicked', () => {
    renderWithRouter();
    const burgerButton = screen.getByLabelText('Ouvrir le menu');

    fireEvent.click(burgerButton);
    expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();

    const mobileLinks = screen.getAllByText('Accueil');
    const mobileLink = mobileLinks[mobileLinks.length - 1];
    fireEvent.click(mobileLink);

    expect(screen.getByLabelText('Ouvrir le menu')).toBeInTheDocument();
  });
});
