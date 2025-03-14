import axios from "axios";

export const getRooms = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/rooms`;
  const response = await axios.get(url);
  return response.data;
};

export interface UpdateRoomMetaDto {
  action: string;
}
export interface RoomMeta {
  _id: string;
  action: string;
}

export const updateRoomMeta = async ({ id, data }) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/room-metas/${id}`;
  const response = await axios.patch(url, data);
  return response.data;
};
