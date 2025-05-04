import { api } from "@/app/lib/api";
import { getAuth } from "@/app/login/auth";
import { Mutex } from "async-mutex";
import axios from "axios";

export interface LoginDto {
  username: string;
  password: string;
}

const mutex = new Mutex();

api.interceptors.request.use(async (config) => {
  // TODO:Rationalise store up to date import value
  const auth = getAuth();
  const accessToken = auth.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) throw error;
    
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      const auth = getAuth();
      try {
        const data = await refresh();
        auth.setAccessToken(data.accessToken);
      } catch (refreshTokenError) {
        if (axios.isAxiosError(refreshTokenError) && refreshTokenError.response?.status === 401) {
          auth.resetAccessToken();
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

export const login = async (data: LoginDto) => {
  const url = "/auth/login";
  const response = await api.post(url, data, { withCredentials: true });
  return response.data;
};

export const logout = async () => {
  const url = "/auth/logout";
  const response = await api.post(url, {}, { withCredentials: true });
  return response.data;
};

export const refresh = async () => {
  const url = "/auth/refresh";
  const response = await axios.post(
    url,
    {},
    { baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, withCredentials: true }
  );
  return response.data;
};

export const getProfile = async () => {
  const url = "/auth/profile";
  const response = await api.get(url);
  return response.data;
};
