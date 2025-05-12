import { api } from "@/app/lib/api";

import type {
  CreateRoomMetaDto,
  RejectReason,
  Room,
  UpdateRoomMetaDto,
} from "@/app/(home)/interfaces";

export const getRooms = async (): Promise<Room[]> => {
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

export const getRejectReasons = async (): Promise<RejectReason[]> => {
  const url = "/upwork/reject-reasons";
  const response = await api.get(url);
  return response.data;
};
