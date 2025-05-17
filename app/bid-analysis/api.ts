import { api } from "@/app/lib/api";

export async function getBidStats() {
  const url = "/upwork/bid-stats";
  const response = await api.get(url);
  return response.data;
}
