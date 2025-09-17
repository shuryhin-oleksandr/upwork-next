import { api } from "@/app/lib/api";

export const getLeads = async () => {
  const url = "/upwork/leads/";
  const response = await api.get(url);
  return response.data;
};
