import { api } from "@/app/lib/api";

export const getJobsFull = async (canonicalIndustryId?: string) => {
  const url = "/upwork/jobs/full";
  const response = await api.get(url, { params: { canonicalIndustryId } });
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

export const getCanonicalIndustries = async () => {
  const url = "/upwork/canonical-industries";
  const response = await api.get(url);
  return response.data;
};
