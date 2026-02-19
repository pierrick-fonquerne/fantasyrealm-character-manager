import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChangePasswordModal } from './ChangePasswordModal';
import { authService } from '../../services/authService';

expect.extend(toHaveNoViolations);

vi.mock('../../services/authService', () => ({
  authService: {
    changePassword: vi.fn(),
  },
}));

const mockChangePassword = vi.mocked(authService.changePassword);

describe('ChangePasswordModal', () => {
  const mockOnSuccess = vi.fn();
  const mockToken = 'test-jwt-token';

  const validFormData = {
    currentPassword: 'OldPassword@123',
    newPassword: 'NewSecure@Pass456',
    confirmNewPassword: 'NewSecure@Pass456',
  };

  const mockChangePasswordResponse = {
    token: 'new-jwt-token',
    expiresAt: '2024-12-31T23:59:59Z',
    user: {
      id: 1,
      email: 'test@example.com',
      pseudo: 'TestUser',
      role: 'User',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal title', () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/changement de mot de passe obligatoire/i)).toBeInTheDocument();
    });

    it('should render explanatory message', () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/pour des raisons de sécurité/i)).toBeInTheDocument();
    });

    it('should render all password fields', () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/mot de passe actuel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^nouveau mot de passe$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmer le nouveau mot de passe/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('button', { name: /changer mon mot de passe/i })).toBeInTheDocument();
    });

    it('should not render close button', () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.queryByRole('button', { name: /fermer/i })).not.toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ChangePasswordModal isOpen={false} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.queryByText(/changement de mot de passe obligatoire/i)).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show error when current password is empty', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe actuel est requis/i)).toBeInTheDocument();
      });
    });

    it('should show error when new password is empty', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/le nouveau mot de passe est requis/i)).toBeInTheDocument();
      });
    });

    it('should show error when confirmation is empty', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/la confirmation est requise/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), 'DifferentPass@789');
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
      });
    });

    it('should show error when new password is weak', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), 'weak');
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), 'weak');
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/ne respecte pas les critères de sécurité/i)).toBeInTheDocument();
      });
    });

    it('should show error when new password is same as current', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.newPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/doit être différent de l'ancien/i)).toBeInTheDocument();
      });
    });

    it('should clear field error when user starts typing', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe actuel est requis/i)).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), 'a');

      await waitFor(() => {
        expect(screen.queryByText(/le mot de passe actuel est requis/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('submission', () => {
    it('should call changePassword with correct data on valid submission', async () => {
      mockChangePassword.mockResolvedValueOnce(mockChangePasswordResponse);

      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(mockChangePassword).toHaveBeenCalledWith(validFormData, mockToken);
      });
    });

    it('should call onSuccess after successful submission', async () => {
      mockChangePassword.mockResolvedValueOnce(mockChangePasswordResponse);

      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockChangePasswordResponse);
      });
    });

    it('should show loading state while submitting', async () => {
      let resolvePromise: (value: typeof mockChangePasswordResponse) => void;
      mockChangePassword.mockImplementation(() => new Promise((resolve) => {
        resolvePromise = resolve;
      }));

      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);

      const button = screen.getByRole('button', { name: /changer mon mot de passe/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('disabled');
      });

      resolvePromise!(mockChangePasswordResponse);
    });

    it('should display API error message on failure', async () => {
      mockChangePassword.mockRejectedValueOnce({
        message: 'Le mot de passe actuel est incorrect.',
        status: 401,
      });

      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe actuel est incorrect/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message when API returns no message', async () => {
      mockChangePassword.mockRejectedValueOnce({
        status: 500,
      });

      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
      });
    });

    it('should clear API error when user starts typing', async () => {
      mockChangePassword.mockRejectedValueOnce({
        message: 'Erreur serveur',
        status: 500,
      });

      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/erreur serveur/i)).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), 'a');

      await waitFor(() => {
        expect(screen.queryByText(/erreur serveur/i)).not.toBeInTheDocument();
      });
    });

    it('should not call onSuccess when submission fails', async () => {
      mockChangePassword.mockRejectedValueOnce({
        message: 'Erreur',
        status: 400,
      });

      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('password strength indicator', () => {
    it('should display password strength indicator when typing new password', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), 'Test');

      await waitFor(() => {
        expect(screen.getByText(/12 caractères min/i)).toBeInTheDocument();
      });
    });

    it('should update strength indicator as password changes', async () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), 'MySecure@Pass123');

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with validation errors', async () => {
      const { container } = render(
        <ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />
      );

      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe actuel est requis/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with API error', async () => {
      mockChangePassword.mockRejectedValueOnce({
        message: 'Erreur serveur',
        status: 500,
      });

      const { container } = render(
        <ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />
      );

      await userEvent.type(screen.getByLabelText(/mot de passe actuel/i), validFormData.currentPassword);
      await userEvent.type(screen.getByLabelText(/^nouveau mot de passe$/i), validFormData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirmer le nouveau mot de passe/i), validFormData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /changer mon mot de passe/i }));

      await waitFor(() => {
        expect(screen.getByText(/erreur serveur/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have dialog role', () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      render(<ChangePasswordModal isOpen={true} token={mockToken} onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });
});
