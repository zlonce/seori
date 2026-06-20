import axios from "axios";
import API_CONFIG from "./config";
import { getAccessToken, setAccessToken } from "../utils/tokenManager";

const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

    // refresh 요청 자체가 실패했거나 이미 재시도한 경우 → 그냥 reject (AuthContext에서 처리)
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post<{ accessToken: string }>(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = refreshResponse.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch {
        // 토큰 재발급 실패 → reject만, 페이지 이동은 호출하는 쪽에서 결정
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default client;