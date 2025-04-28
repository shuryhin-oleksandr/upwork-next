import { CreateRoomMetaDto, UpdateRoomMetaDto } from "@/app/interfaces";
import axios from "axios";

export const getRooms = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/rooms`;
  const response = await axios.get(url);
  return response.data;
};

export const updateRoomMeta = async (data: UpdateRoomMetaDto) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/room-metas/${data._id}`;
  const response = await axios.patch(url, data);
  return response.data;
};

export const createRoomMeta = async (data: CreateRoomMetaDto) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/room-metas/`;
  const response = await axios.post(url, data);
  return response.data;
};

export const getRejectReasons = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/reject-reasons`;
  const response = await axios.get(url);
  return response.data;
};
