"use client";

import { getBidStatistics } from "@/app/bid-analysis/api";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import { Typography } from "antd";

const { Text } = Typography;

const columns = [
  {
    title: "Job",
    dataIndex: "title",
  },
  {
    title: "Interviewing",
    dataIndex: "interviewing",
  },
  {
    title: "Hired",
    dataIndex: "hired",
  },
];

export default function BidAnalysis() {
  const { data: jobs, isPending, isError, error } = useQuery({
    queryKey: ["bid-statistics"],
    queryFn: getBidStatistics,
  });

  if (isError) return <Text>Error: {error.message}</Text>;

  return (
    <Card>
      <Table dataSource={jobs} columns={columns} size="small" rowKey="id" loading={isPending} />
    </Card>
  );
}
