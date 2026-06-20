import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  getRefreshToken,
  isTokenValid,
  decodeToken,
  saveTokens,
  clearTokens,
} from "../utils/tokenManager";

export type User = {
  userId: string;
  phone: string;
  role: "ROLE_OWNER" | "ROLE_STAFF";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => User | null;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const buildUserFromToken = (token: string): User | null => {
  const decoded = decodeToken(token) as {
    userId: string;
    sub: string;
    role: string;
  } | null;
  if (!decoded) return null;
  return {
    userId: decoded.userId,
    phone: decoded.sub,
    role: decoded.role as User["role"],
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken && isTokenValid(accessToken)) {
        const parsed = buildUserFromToken(accessToken);
        if (parsed) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      } else if (refreshToken) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    (accessToken: string, refreshToken: string): User | null => {
      saveTokens(accessToken, refreshToken);
      const parsed = buildUserFromToken(accessToken);
      if (parsed) {
        setUser(parsed);
        setIsAuthenticated(true);
      }
      return parsed;
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};