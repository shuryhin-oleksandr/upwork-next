import { api } from "@/app/lib/api";

export const getJobsWithMeta = async () => {
  const url = "/upwork/jobs-with-metas";
  const response = await api.get(url);
  return response.data;
};

export const getAndSaveUpworkJobs = async () => {
  const url = "/upwork/jobs/fetch";
  const response = await api.get(url);
  return response.data;
};

export const analyzeJobs = async () => {
  const url = "/upwork/jobs/analyze";
  const response = await api.get(url);
  return response.data;
};