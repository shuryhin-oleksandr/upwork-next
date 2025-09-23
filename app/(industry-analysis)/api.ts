import { api } from "@/app/lib/api";

export const getCanonicalIndustries = async () => {
  const url = "/upwork/canonical-industries";
  const response = await api.get(url);
  return response.data;
};
