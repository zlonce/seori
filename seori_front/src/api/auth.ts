import type { AxiosError } from "axios";
import client from "./client";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type RefreshData = {
  accessToken: string;
  expiresIn: number;
};

export const loginAPI = async (
  userId: string,
  password: string,
): Promise<
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: string }
> => {
  try {
    const response = await client.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", { userId, password });
    return {
      success: true,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      error: error.response?.data?.error?.message ?? "로그인에 실패했습니다",
    };
  }
};

export const logoutAPI = async (): Promise<
  { success: true } | { success: false; error: string }
> => {
  try {
    const response = await client.post<{ success: boolean }>("/auth/logout");
    if (response.data.success) {
      return { success: true };
    }
    return { success: false, error: "로그아웃에 실패했습니다" };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      error: error.response?.data?.error?.message ?? "로그아웃에 실패했습니다",
    };
  }
};

export const refreshTokenAPI = async (
  refreshToken: string,
): Promise<
  | { success: true; accessToken: string; expiresIn: number }
  | { success: false; error: string }
> => {
  try {
    const response = await client.post<{ success: boolean; data: RefreshData }>(
      "/auth/refresh",
      { refreshToken },
    );
    if (response.data.success) {
      return {
        success: true,
        accessToken: response.data.data.accessToken,
        expiresIn: response.data.data.expiresIn,
      };
    }
    return { success: false, error: "토큰 갱신에 실패했습니다" };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      error: error.response?.data?.error?.message ?? "토큰 갱신에 실패했습니다",
    };
  }
};

export const changePasswordAPI = async (
  oldPassword: string,
  newPassword: string,
): Promise<{ success: boolean; data?: unknown; error?: string }> => {
  try {
    const response = await client.put<{ success: boolean; data: unknown }>(
      "/auth/change-password",
      { oldPassword, newPassword },
    );
    return { success: response.data.success, data: response.data.data };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      error:
        error.response?.data?.error?.message ?? "비밀번호 변경에 실패했습니다",
    };
  }
};