"use client";

import { getProposals } from "@/app/proposals/api";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
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

export default function Proposals() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: getProposals,
  });
  if (error) return <div>Error loading proposals</div>;

  const columns = [
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
    },
    { title: "Hired", dataIndex: "totalHired", key: "totalHired" },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data || []}
      pagination={false}
      loading={isLoading}
    />
  );
}
