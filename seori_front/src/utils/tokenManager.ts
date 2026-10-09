// Access token은 메모리에만 저장 (XSS 방어)
// Refresh token은 백엔드가 HttpOnly 쿠키로 관리

let _accessToken: string | null = null;

export const setAccessToken = (token: string): void => {
  _accessToken = token;
};

export const getAccessToken = (): string | null => {
  return _accessToken;
};

export const clearAccessToken = (): void => {
  _accessToken = null;
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
  return Date.now() < decoded.exp * 1000;
};