export interface CreateProposalMetaDto {
  proposalId: string;
  hiredRate?: number;
}

export interface UpdateProposalMetaDto {
  id: string;
  proposalId: string;
  hiredRate?: number;
}

export interface ProposalMeta {
  _id: string;
  proposalId: string;
  hiredRate?: number;
}

export interface Proposal {
  id: string;
  proposalId: string;
  upworkStatus: string;
  jobUrl: string;
  jobTitle: string;
  jobAvailability: string;
  createdDateTime: string;
  totalInvitedToInterview: number;
  totalHired: number;
  isLead: boolean;
  status: ProposalStatus;
  meta: ProposalMeta;
}

export enum ProposalStatus {
  NO_INTERVIEW = "No interview",
  COMMUNICATED_WITH_LESS_THAN_THREE = "Communicated with 1-2",
  COMMUNICATED_WITH_THREE_PLUS = "Communicated with >= 3",
  LEAD = "Lead",
  HIRED = "Hired",
  NO_LONGER_AVAILABLE = "No longer available",
}
