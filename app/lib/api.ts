import { refresh } from "@/app/login/api";
import { AuthManager } from "@/app/login/AuthManager";
import { Mutex } from "async-mutex";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

const mutex = new Mutex();

api.interceptors.request.use(async (config) => {
  const accessToken = AuthManager.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) throw error;

    const refreshToken = AuthManager.getRefreshToken() || "";
    if (!refreshToken) {
      AuthManager.logout();
      throw error;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const data = await refresh(refreshToken);
        AuthManager.setTokens(data);
      } catch (refreshTokenError) {
        if (axios.isAxiosError(refreshTokenError) && refreshTokenError.response?.status === 401) {
          AuthManager.logout();
          throw error;
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
    }

    return api.request(error.config);
  }
);
