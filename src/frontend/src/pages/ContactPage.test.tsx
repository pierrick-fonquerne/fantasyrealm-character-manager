import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ContactPage from './ContactPage';
import { contactService } from '../services/contactService';

expect.extend(toHaveNoViolations);

vi.mock('../services/contactService', () => ({
  contactService: {
    sendMessage: vi.fn(),
  },
}));

let mockAuthState = {
  user: null as { id: number; email: string; pseudo: string; role: string } | null,
  isAuthenticated: false,
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

const renderContactPage = () => {
  return render(
    <BrowserRouter>
      <ContactPage />
    </BrowserRouter>
  );
};

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    };
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderContactPage();
      expect(screen.getByRole('heading', { name: /contactez-nous/i })).toBeInTheDocument();
    });

    it('should render skip link', () => {
      renderContactPage();
      expect(screen.getByText('Aller au contenu principal')).toBeInTheDocument();
    });

    it('should render contact form with all fields', () => {
      renderContactPage();
      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pseudo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /envoyer le message/i })).toBeInTheDocument();
    });

    it('should have no accessibility violations', async () => {
      const { container } = renderContactPage();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mockAuthState = {
        ...mockAuthState,
        user: { id: 1, email: 'test@example.com', pseudo: 'TestHero', role: 'User' },
        isAuthenticated: true,
        token: 'fake-token',
      };
    });

    it('should pre-fill email and pseudo when authenticated', () => {
      renderContactPage();
      expect(screen.getByLabelText(/adresse email/i)).toHaveValue('test@example.com');
      expect(screen.getByLabelText(/pseudo/i)).toHaveValue('TestHero');
    });

    it('should disable email and pseudo fields when authenticated', () => {
      renderContactPage();
      expect(screen.getByLabelText(/adresse email/i)).toBeDisabled();
      expect(screen.getByLabelText(/pseudo/i)).toBeDisabled();
    });
  });

  describe('validation', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      renderContactPage();

      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      expect(screen.getByText("L'email est requis")).toBeInTheDocument();
    });

    it('should show error when email format is invalid', async () => {
      const user = userEvent.setup();
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      expect(screen.getByText("L'email n'est pas valide")).toBeInTheDocument();
    });

    it('should show error when pseudo is empty', async () => {
      const user = userEvent.setup();
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      expect(screen.getByText('Le pseudo est requis')).toBeInTheDocument();
    });

    it('should show error when message is empty', async () => {
      const user = userEvent.setup();
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/pseudo/i), 'TestHero');
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      expect(screen.getByText('Le message est requis')).toBeInTheDocument();
    });

    it('should show error when message is too short', async () => {
      const user = userEvent.setup();
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/pseudo/i), 'TestHero');
      await user.type(screen.getByLabelText(/message/i), 'Court');
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      expect(
        screen.getByText('Le message doit contenir au moins 20 caractères')
      ).toBeInTheDocument();
    });
  });

  describe('submission', () => {
    it('should call contactService on valid submission', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.sendMessage).mockResolvedValue({
        message: 'Votre message a été envoyé avec succès.',
      });
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/pseudo/i), 'TestHero');
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test suffisamment long'
      );
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      await waitFor(() => {
        expect(contactService.sendMessage).toHaveBeenCalledWith({
          email: 'test@example.com',
          pseudo: 'TestHero',
          message: 'Ceci est un message de test suffisamment long',
        });
      });
    });

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.sendMessage).mockResolvedValue({
        message: 'Votre message a été envoyé avec succès.',
      });
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/pseudo/i), 'TestHero');
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test suffisamment long'
      );
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Votre message a été envoyé avec succès.')
        ).toBeInTheDocument();
      });
    });

    it('should reset form after successful submission when not authenticated', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.sendMessage).mockResolvedValue({
        message: 'Votre message a été envoyé avec succès.',
      });
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/pseudo/i), 'TestHero');
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test suffisamment long'
      );
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/adresse email/i)).toHaveValue('');
        expect(screen.getByLabelText(/pseudo/i)).toHaveValue('');
        expect(screen.getByLabelText(/message/i)).toHaveValue('');
      });
    });

    it('should show API error on failure', async () => {
      const user = userEvent.setup();
      vi.mocked(contactService.sendMessage).mockRejectedValue({
        message: "Aucun compte n'est associé à ce pseudo.",
      });
      renderContactPage();

      await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/pseudo/i), 'UnknownHero');
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test suffisamment long'
      );
      await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Aucun compte n'est associé à ce pseudo.")
        ).toBeInTheDocument();
      });
    });
  });
});
