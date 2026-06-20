import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * 인증 상태 및 함수 사용
 * useAuth().user, useAuth().isAuthenticated 등
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
