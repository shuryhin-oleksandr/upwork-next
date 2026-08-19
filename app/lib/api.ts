import { CreateRoomMetaDto, UpdateRoomMetaDto } from "@/app/(home)/interfaces";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});
export const createRoomMeta = async (data: CreateRoomMetaDto) => {
  const url = "/upwork/room-metas/";
  const response = await api.post(url, data);
  return response.data;
};
export const updateRoomMeta = async (data: UpdateRoomMetaDto) => {
  const url = `/upwork/room-metas/${data.id}`;
  const response = await api.patch(url, data);
  return response.data;
};
