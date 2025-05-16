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
    sorter: { compare: (a, b) => a.interviewing - b.interviewing, multiple: 1 },
    sortDirections: ["descend"],
  },
  {
    title: "Hired",
    dataIndex: "hired",
    sorter: { compare: (a, b) => a.hired - b.hired, multiple: 2 },
    sortDirections: ["descend"],
  },
];

export default function BidAnalysis() {
  const {
    data: jobs,
    isPending,
    isError,
    error,
  } = useQuery({ queryKey: ["bid-statistics"], queryFn: getBidStatistics });

  if (isError) return <Text>Error: {error.message}</Text>;

  return (
    <Card>
      <Table
        dataSource={jobs}
        columns={columns}
        size="small"
        rowKey="id"
        loading={isPending}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: true,
          defaultPageSize: 50,
        }}
      />
    </Card>
  );
}
