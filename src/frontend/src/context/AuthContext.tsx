import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserInfo, LoginResponse } from '../services/authService';

const TOKEN_KEY = 'fantasyrealm_token';
const USER_KEY = 'fantasyrealm_user';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const getInitialState = (): { token: string | null; user: UserInfo | null } => {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);

  if (storedToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser) as UserInfo;
      return { token: storedToken, user: parsedUser };
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  return { token: null, user: null };
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const initialState = getInitialState();
  const [user, setUser] = useState<UserInfo | null>(initialState.user);
  const [token, setToken] = useState<string | null>(initialState.token);

  const login = (response: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth, type AuthContextType };
