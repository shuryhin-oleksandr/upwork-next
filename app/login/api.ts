import { api } from "@/app/lib/api";
import axios from "axios";

export interface LoginDto {
  username: string;
  password: string;
}

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

export const getProfile = async () => {
  const url = "/auth/profile";
  const response = await api.get(url);
  return response.data;
};
