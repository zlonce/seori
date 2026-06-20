import { refreshTokenAPI } from "../api/auth";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const saveTokens = (accessToken: string, refreshToken: string): void => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const refreshToken = async (): Promise<boolean> => {
  const currentRefreshToken = getRefreshToken();

  if (!currentRefreshToken) {
    throw new Error("Refresh token not found");
  }

  const result = await refreshTokenAPI(currentRefreshToken);

  if (result.success) {
    setAccessToken(result.accessToken!);
    return true;
  }

  clearTokens();
  throw new Error(result.error);
};

export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || typeof decoded.exp !== "number") return false;

  const expirationTime = decoded.exp * 1000;
  return Date.now() < expirationTime;
};
