import { CreateRoomMetaDto, LoginDto, UpdateRoomMetaDto } from "@/app/interfaces";
import { emitter, REDIRECT_TO_LOGIN } from "@/app/lib/events";
import { TokenManager } from "@/app/lib/TokenManager";
import { Mutex } from "async-mutex";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

const mutex = new Mutex();

api.interceptors.request.use(async (config) => {
  const accessToken = TokenManager.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) throw error;

    const refreshToken = TokenManager.getRefreshToken() || "";
    if (!refreshToken) {
      TokenManager.removeTokens();
      emitter.emit(REDIRECT_TO_LOGIN);
      throw error;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const data = await refresh(refreshToken);
        TokenManager.setTokens(data);
      } catch (refreshTokenError) {
        if (axios.isAxiosError(refreshTokenError) && refreshTokenError.response?.status === 401) {
          TokenManager.removeTokens();
          emitter.emit(REDIRECT_TO_LOGIN);
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

export const getRooms = async () => {
  const url = "/upwork/rooms";
  const response = await api.get(url);
  return response.data;
};

export const updateRoomMeta = async (data: UpdateRoomMetaDto) => {
  const url = `/upwork/room-metas/${data._id}`;
  const response = await api.patch(url, data);
  return response.data;
};

export const createRoomMeta = async (data: CreateRoomMetaDto) => {
  const url = "/upwork/room-metas/";
  const response = await api.post(url, data);
  return response.data;
};

// TODO: Rationalise location
export const login = async (data: LoginDto) => {
  const url = "/auth/login";
  const response = await api.post(url, data);
  return response.data;
};

export const refresh = async (refreshToken: string) => {
  const url = "/auth/refresh";
  const response = await axios.post(
    url,
    { refreshToken },
    { baseURL: process.env.NEXT_PUBLIC_BACKEND_URL }
  );
  return response.data;
};
