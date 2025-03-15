import axios from "axios";

export const getRooms = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/rooms`;
  const response = await axios.get(url);
  return response.data;
};

export const updateRoomMeta = async (data) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/room-metas/${data._id}`;
  const response = await axios.patch(url, data);
  return response.data;
};
