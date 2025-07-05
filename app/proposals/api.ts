import { api } from "@/app/lib/api";

export const getProposals = async (startDate: string) => {
  const url = "/upwork/proposals";
  const response = await api.get(url, { params: { startDate } });
  return response.data;
};
