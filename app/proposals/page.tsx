"use client";

import { getProposals } from "@/app/proposals/api";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, TableProps } from "antd";
import TypographyText from "antd/es/typography/Text";
import dayjs from "dayjs";

enum JobStatus {
  Active = "ACTIVE",
  Closed = "CLOSED",
}

interface Proposal {
  id: string;
  jobUrl: string;
  jobTitle: string;
  jobAvailability: string;
  createdDateTime: string;
  totalInvitedToInterview: number;
  totalHired: number;
  status: ProposalStatus;
}

export enum ProposalStatus {
  NO_INTERVIEW = "No interview",
  COMMUNICATED_WITH_LESS_THAN_THREE = "Communicated with 1-2",
  COMMUNICATED_WITH_THREE_PLUS = "Communicated with >= 3",
  LEAD = "Lead",
  HIRED = "Hired",
  NO_LONGER_AVAILABLE = "No longer available",
}

function BidStats({ proposals }: { proposals: Proposal[] | undefined }) {
  if (!proposals) return null;

  const totalCount = proposals.length;

  const statusCounts: Record<string, number> = {};
  for (const status of Object.values(ProposalStatus)) {
    statusCounts[status] = proposals.filter((p) => p.status === status).length;
  }
  statusCounts["Total"] = totalCount;

  return Object.entries(statusCounts).map(([status, count]: [string, number]) => (
    <div key={status}>
      {status}
      {`${count} - ${Math.round((count / totalCount) * 100)}%`}
    </div>
  ));
}

type ColumnTypes = Exclude<TableProps<Proposal>["columns"], undefined>;

function ProposalsTable({
  proposals,
  isLoading,
}: {
  proposals: Proposal[] | undefined;
  isLoading: boolean;
}) {
  const columns: ColumnTypes = [
    {
      title: "Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text: string, record: Proposal) => (
        <a href={record.jobUrl} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    { title: "Upw status", dataIndex: "upworkStatus", key: "upworkStatus" },
    {
      title: "Date",
      dataIndex: "createdDateTime",
      key: "createdDateTime",
      render: (value: string) => (
        <TypographyText style={{ textWrap: "nowrap" }}>
          {dayjs(value).format("D MMM YY")}
        </TypographyText>
      ),
    },
    {
      title: "Time",
      dataIndex: "createdDateTime",
      key: "createdTime",
      render: (value: string) => (
        <TypographyText style={{ textWrap: "nowrap" }}>
          {dayjs(value).format("HH:mm")}
        </TypographyText>
      ),
    },
    {
      title: "Interview",
      dataIndex: "totalInvitedToInterview",
      key: "totalInvitedToInterview",
      align: "center",
      render: (value: number) => (
        <TypographyText style={{ opacity: value ? 1 : 0.1 }}>{value}</TypographyText>
      ),
    },
    {
      title: "Hired",
      dataIndex: "totalHired",
      key: "totalHired",
      align: "center",
      render: (value: number) => (
        <TypographyText style={{ opacity: value ? 1 : 0.1 }}>{value}</TypographyText>
      ),
    },
    {
      title: "Available",
      dataIndex: "jobAvailability",
      key: "jobAvailability",
      align: "center",
      render: (value) => value != JobStatus.Active && "X",
    },
    {
      title: "Lead",
      dataIndex: "isLead",
      key: "isLead",
      align: "center",
      render: (value) => value && "+",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
    },
  ];
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={proposals || []}
      pagination={false}
      loading={isLoading}
    />
  );
}

export default function Proposals() {
  const startDate = "2025-06-01";
  const {
    data: proposals,
    error,
    isLoading,
  } = useQuery<Proposal[]>({
    queryKey: ["proposals"],
    queryFn: () => getProposals(startDate),
  });
  if (error) return <div>Error loading proposals</div>;

  return (
    <Card>
      <BidStats {...{ proposals }} />
      <ProposalsTable {...{ proposals, isLoading }} />
    </Card>
  );
}
