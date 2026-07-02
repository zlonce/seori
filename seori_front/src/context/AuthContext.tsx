import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  decodeToken,
  isTokenValid,
} from "../utils/tokenManager";
import { refreshTokenAPI, logoutAPI } from "../api/auth";

export type User = {
  userId: string;
  phone: string;
  role: "ROLE_OWNER" | "ROLE_MANAGER" | "ROLE_STAFF";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => User | null;
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
    const initializeAuth = async () => {
      const accessToken = getAccessToken();

      if (accessToken && isTokenValid(accessToken)) {
        // 같은 세션에서 메모리 토큰이 살아있는 경우
        const parsed = buildUserFromToken(accessToken);
        if (parsed) {
          setUser(parsed);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }

      // 새로고침 등으로 메모리가 초기화된 경우 → HttpOnly 쿠키로 재발급
      const result = await refreshTokenAPI();
      if (result.success) {
        setAccessToken(result.accessToken);
        const parsed = buildUserFromToken(result.accessToken);
        if (parsed) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback((accessToken: string): User | null => {
    setAccessToken(accessToken);
    const parsed = buildUserFromToken(accessToken);
    if (parsed) {
      setUser(parsed);
      setIsAuthenticated(true);
    }
    return parsed;
  }, []);

  const logout = useCallback(() => {
    logoutAPI(); // 백엔드 쿠키 삭제
    clearAccessToken();
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
