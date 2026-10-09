import type { AxiosError } from "axios";
import client from "./client";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export const loginAPI = async (
  userId: string,
  password: string,
): Promise<
  | { success: true; accessToken: string }
  | { success: false; error: string }
> => {
  try {
    const response = await client.post<{ accessToken: string }>(
      "/auth/login",
      { userId, password },
    );
    return { success: true, accessToken: response.data.accessToken };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      error: error.response?.data?.error?.message ?? "로그인에 실패했습니다",
    };
  }
};

export const refreshTokenAPI = async (): Promise<
  | { success: true; accessToken: string }
  | { success: false; error: string }
> => {
  try {
    // HttpOnly 쿠키가 자동으로 전송됨
    const response = await client.post<{ accessToken: string }>("/auth/refresh");
    return { success: true, accessToken: response.data.accessToken };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      error: error.response?.data?.error?.message ?? "토큰 갱신에 실패했습니다",
    };
  }
};

export const logoutAPI = async (): Promise<void> => {
  try {
    await client.post("/auth/logout");
  } catch {
    // 로그아웃은 실패해도 로컬 상태는 클리어
  }
};

export const changePasswordAPI = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await client.patch("/users/password", { currentPassword, newPassword });
    return { success: true };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      error:
        error.response?.data?.error?.message ?? "비밀번호 변경에 실패했습니다",
    };
  }
};