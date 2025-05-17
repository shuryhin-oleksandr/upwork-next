import { api } from "@/app/lib/api";

export interface JobStats {
  id: string;
  url: string;
  title: string;
  interviewing: number;
  hired: number;
}

export async function getBidStats(): Promise<JobStats[]> {
  const url = "/upwork/bid-stats";
  const response = await api.get(url);
  return response.data;
}
