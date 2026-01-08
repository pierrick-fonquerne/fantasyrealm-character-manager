import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

expect.extend(toHaveNoViolations);

describe('PasswordStrengthIndicator', () => {
  describe('empty password', () => {
    it('should not render anything when password is empty', () => {
      const { container } = render(<PasswordStrengthIndicator password="" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('strength bar', () => {
    it('should render a progress bar', () => {
      render(<PasswordStrengthIndicator password="test" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should have aria-label for accessibility', () => {
      render(<PasswordStrengthIndicator password="test" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Force du mot de passe');
    });

    it('should display "Faible" label for weak password', () => {
      render(<PasswordStrengthIndicator password="a" />);

      expect(screen.getByText('Faible')).toBeInTheDocument();
    });

    it('should display "Fort" label for strong password', () => {
      // Score 3: minLength + uppercase + lowercase (no digit, no special, <16 chars)
      render(<PasswordStrengthIndicator password="Mysecurepass" />);

      expect(screen.getByText('Fort')).toBeInTheDocument();
    });

    it('should display "Très fort" label for very strong password', () => {
      render(<PasswordStrengthIndicator password="MySecure@Pass1" />);

      expect(screen.getByText('Très fort')).toBeInTheDocument();
    });
  });

  describe('criteria list', () => {
    it('should display all 5 criteria', () => {
      render(<PasswordStrengthIndicator password="test" />);

      expect(screen.getByText('12 caractères min.')).toBeInTheDocument();
      expect(screen.getByText('Une majuscule')).toBeInTheDocument();
      expect(screen.getByText('Une minuscule')).toBeInTheDocument();
      expect(screen.getByText('Un chiffre')).toBeInTheDocument();
      expect(screen.getByText('Un caractère spécial')).toBeInTheDocument();
    });

    it('should show check icon for met criteria', () => {
      render(<PasswordStrengthIndicator password="abc" />);

      const lowercaseItem = screen.getByText('Une minuscule').closest('li');
      expect(lowercaseItem).toHaveClass('text-success-500');
    });

    it('should show circle icon for unmet criteria', () => {
      render(<PasswordStrengthIndicator password="abc" />);

      const uppercaseItem = screen.getByText('Une majuscule').closest('li');
      expect(uppercaseItem).toHaveClass('text-cream-400');
    });

    it('should update criteria when password changes', () => {
      const { rerender } = render(<PasswordStrengthIndicator password="abc" />);

      let uppercaseItem = screen.getByText('Une majuscule').closest('li');
      expect(uppercaseItem).toHaveClass('text-cream-400');

      rerender(<PasswordStrengthIndicator password="abcABC" />);

      uppercaseItem = screen.getByText('Une majuscule').closest('li');
      expect(uppercaseItem).toHaveClass('text-success-500');
    });
  });

  describe('accessibility', () => {
    it('should have aria-live for screen readers', () => {
      render(<PasswordStrengthIndicator password="test" />);

      const container = screen.getByRole('progressbar').closest('[aria-live]');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper aria values on progress bar', () => {
      render(<PasswordStrengthIndicator password="MySecure@Pass1" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '5');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
    });
  });

  describe('visual states', () => {
    it('should show all criteria as unmet for password with only numbers', () => {
      render(<PasswordStrengthIndicator password="123" />);

      expect(screen.getByText('Une majuscule').closest('li')).toHaveClass('text-cream-400');
      expect(screen.getByText('Une minuscule').closest('li')).toHaveClass('text-cream-400');
      expect(screen.getByText('Un chiffre').closest('li')).toHaveClass('text-success-500');
      expect(screen.getByText('Un caractère spécial').closest('li')).toHaveClass('text-cream-400');
    });

    it('should show all criteria as met for valid password', () => {
      render(<PasswordStrengthIndicator password="MySecure@Pass1" />);

      expect(screen.getByText('12 caractères min.').closest('li')).toHaveClass('text-success-500');
      expect(screen.getByText('Une majuscule').closest('li')).toHaveClass('text-success-500');
      expect(screen.getByText('Une minuscule').closest('li')).toHaveClass('text-success-500');
      expect(screen.getByText('Un chiffre').closest('li')).toHaveClass('text-success-500');
      expect(screen.getByText('Un caractère spécial').closest('li')).toHaveClass('text-success-500');
    });
  });

  describe('accessibility (RGAA/WCAG)', () => {
    it('should have no accessibility violations with weak password', async () => {
      const { container } = render(<PasswordStrengthIndicator password="weak" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with strong password', async () => {
      const { container } = render(<PasswordStrengthIndicator password="MySecure@Pass1" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
