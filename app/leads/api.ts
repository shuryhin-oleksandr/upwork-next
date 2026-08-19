import { api } from "@/app/lib/api";
import { Dayjs } from "dayjs";

export const getLeads = async (startDate?: Dayjs | null, endDate?: Dayjs | null) => {
  const url = "/upwork/leads/";
  const response = await api.get(url, { params: { startDate, endDate } });
  return response.data;
};
