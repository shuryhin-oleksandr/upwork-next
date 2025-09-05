import { api } from "@/app/lib/api";
import { CreateProposalMetaDto, UpdateProposalMetaDto } from "@/app/proposals/interfaces";
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

export const updateProposalMeta = async (data: UpdateProposalMetaDto) => {
  const url = `/upwork/proposal-metas/${data._id}`;
  const response = await api.patch(url, data);
  return response.data;
};

export const createProposalMeta = async (data: CreateProposalMetaDto) => {
  const url = "/upwork/proposal-metas/";
  const response = await api.post(url, data);
  return response.data;
};

