import { api } from "@/app/lib/api";
import { Dayjs } from "dayjs";

export const getProposals = async ({
  startDate,
  endDate,
}: {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}) => {
  const url = "/upwork/proposals";
  const response = await api.get(url, { params: { startDate, endDate } });
  return response.data;
};
