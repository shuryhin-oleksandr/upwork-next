import { api } from "@/app/lib/api";

export const getRooms = async ({ excludeContracts }: { excludeContracts?: boolean }) => {
  const url = "/upwork/rooms";
  const response = await api.get(url, { params: { excludeContracts } });
  return response.data;
};

export const getLossReasons = async () => {
  const url = "/upwork/loss-reasons";
  const response = await api.get(url);
  return response.data;
};
