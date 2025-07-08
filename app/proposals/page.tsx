"use client";

import { getProposals } from "@/app/proposals/api";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, TableProps } from "antd";
import dayjs from "dayjs";
import TypographyText from "antd/es/typography/Text";

enum JobStatus {
  Active = "ACTIVE",
  Closed = "CLOSED",
}

interface Proposal {
  id: string;
  jobUrl: string;
  jobTitle: string;
  status: string;
  createdDateTime: string;
  totalInvitedToInterview: number;
  totalHired: number;
}

type ColumnTypes = Exclude<TableProps<Proposal>["columns"], undefined>;

function ProposalsTable({ proposals, isLoading }: { proposals: Proposal[]; isLoading: boolean }) {
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
      dataIndex: "workFlowStatus",
      key: "workFlowStatus",
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
  } = useQuery({
    queryKey: ["proposals"],
    queryFn: () => getProposals(startDate),
  });
  if (error) return <div>Error loading proposals</div>;

  return (
    <Card>
      <ProposalsTable {...{ proposals, isLoading }} />
    </Card>
  );
}
