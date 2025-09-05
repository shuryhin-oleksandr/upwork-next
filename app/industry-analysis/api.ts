import { api } from "@/app/lib/api";

export const getJobsWithMeta = async () => {
  const url = "/upwork/jobs-with-metas";
  const response = await api.get(url);
  return response.data;
};
