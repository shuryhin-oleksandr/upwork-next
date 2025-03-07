import axios from "axios";

export const getRooms = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/rooms`;
  const response = await axios.get(url);
  return response.data;
};
