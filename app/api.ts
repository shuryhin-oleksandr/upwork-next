import { CreateRoomMetaDto, LoginDto, UpdateRoomMetaDto } from "@/app/interfaces";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  console.log(config.headers);
  return config;
});

export const getRooms = async () => {
  const url = '/upwork/rooms';
  const response = await api.get(url);
  return response.data;
};

export const updateRoomMeta = async (data: UpdateRoomMetaDto) => {
  const url = `/upwork/room-metas/${data._id}`;
  const response = await api.patch(url, data);
  return response.data;
};

export const createRoomMeta = async (data: CreateRoomMetaDto) => {
  const url = '/upwork/room-metas/';
  const response = await api.post(url, data);
  return response.data;
};

// TODO: Rationalise location
export const login = async (data: LoginDto) => {
  const url = '/auth/login';
  const response = await api.post(url, data);
  return response.data;
};

export const refreshToken = async (refreshToken: string) => {
  const url = '/auth/refresh';
  const response = await api.post(url, { refreshToken });
  return response.data;
};
