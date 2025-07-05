"use client";

import { getProposals } from "@/app/proposals/api";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, TableProps } from "antd";
import dayjs from "dayjs";
import TypographyText from "antd/es/typography/Text";

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

export default function Proposals() {
  const {
    data: proposals,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["proposals"],
    queryFn: getProposals,
  });
  if (error) return <div>Error loading proposals</div>;

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
    { title: "Status", dataIndex: "status", key: "status" },
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
  ];

  return (
    <Card>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={proposals || []}
        pagination={false}
        loading={isLoading}
      />
    </Card>
  );
}
