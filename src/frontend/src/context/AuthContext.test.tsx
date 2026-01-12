import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import type { LoginResponse } from '../services/authService';

const TOKEN_KEY = 'fantasyrealm_token';
const USER_KEY = 'fantasyrealm_user';

const TestComponent = () => {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  const mockLoginResponse: LoginResponse = {
    token: 'test-jwt-token',
    expiresAt: '2024-12-31T23:59:59Z',
    user: {
      id: 1,
      email: 'test@example.com',
      pseudo: 'TestUser',
      role: 'User',
    },
    mustChangePassword: false,
  };

  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="user-email">{user?.email || 'null'}</div>
      <div data-testid="user-pseudo">{user?.pseudo || 'null'}</div>
      <div data-testid="user-role">{user?.role || 'null'}</div>
      <button onClick={() => login(mockLoginResponse)}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have null user and token when localStorage is empty', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');
    });

    it('should restore user and token from localStorage on mount', () => {
      const storedUser = {
        id: 1,
        email: 'stored@example.com',
        pseudo: 'StoredUser',
        role: 'Admin',
      };
      localStorage.setItem(TOKEN_KEY, 'stored-token');
      localStorage.setItem(USER_KEY, JSON.stringify(storedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
      expect(screen.getByTestId('user-email')).toHaveTextContent('stored@example.com');
      expect(screen.getByTestId('user-pseudo')).toHaveTextContent('StoredUser');
      expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
    });

    it('should clear invalid JSON from localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'some-token');
      localStorage.setItem(USER_KEY, 'invalid-json');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });

    it('should not authenticate if only token is present without user', () => {
      localStorage.setItem(TOKEN_KEY, 'some-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });

    it('should not authenticate if only user is present without token', () => {
      const storedUser = {
        id: 1,
        email: 'stored@example.com',
        pseudo: 'StoredUser',
        role: 'User',
      };
      localStorage.setItem(USER_KEY, JSON.stringify(storedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });

  describe('login', () => {
    it('should update state when login is called', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');

      await userEvent.click(screen.getByRole('button', { name: /login/i }));

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('token')).toHaveTextContent('test-jwt-token');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-pseudo')).toHaveTextContent('TestUser');
      expect(screen.getByTestId('user-role')).toHaveTextContent('User');
    });

    it('should persist token to localStorage when login is called', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await userEvent.click(screen.getByRole('button', { name: /login/i }));

      expect(localStorage.getItem(TOKEN_KEY)).toBe('test-jwt-token');
    });

    it('should persist user to localStorage when login is called', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await userEvent.click(screen.getByRole('button', { name: /login/i }));

      const storedUser = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      expect(storedUser.email).toBe('test@example.com');
      expect(storedUser.pseudo).toBe('TestUser');
      expect(storedUser.role).toBe('User');
    });
  });

  describe('logout', () => {
    it('should clear state when logout is called', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await userEvent.click(screen.getByRole('button', { name: /login/i }));
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');

      await userEvent.click(screen.getByRole('button', { name: /logout/i }));

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');
    });

    it('should clear localStorage when logout is called', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await userEvent.click(screen.getByRole('button', { name: /login/i }));
      expect(localStorage.getItem(TOKEN_KEY)).toBe('test-jwt-token');

      await userEvent.click(screen.getByRole('button', { name: /logout/i }));

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });
});
