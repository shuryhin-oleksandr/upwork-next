import { CreateRoomMetaDto, UpdateRoomMetaDto } from "@/app/(home)/interfaces";
import { api } from "@/app/lib/api";

export const getRooms = async (filter?: string) => {
  const url = `/upwork/rooms${filter ? `?filter=${filter}` : ""}`;
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
