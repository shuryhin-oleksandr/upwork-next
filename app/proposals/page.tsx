"use client";

import { getProposals } from "@/app/proposals/api";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

export default function Proposals() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: getProposals,
  });
  if (error) return <div>Error loading proposals</div>;

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Job ID", dataIndex: "jobId", key: "jobId" },
    { title: "Title", dataIndex: "jobTitle", key: "jobTitle" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Created Date", dataIndex: "createdDateTime", key: "createdDateTime" },
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
