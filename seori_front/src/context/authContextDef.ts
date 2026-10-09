import { createContext } from "react";

export type User = {
  userId: string;
  phone: string;
  role: "ROLE_OWNER" | "ROLE_MANAGER" | "ROLE_STAFF";
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => User | null;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
