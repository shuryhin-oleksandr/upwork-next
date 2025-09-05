"use client";

import { useQuery } from "@tanstack/react-query";
import type { TableProps } from "antd";
import { Flex, Table, Tag } from "antd";
import { getJobsWithMeta } from "./api";
import JobUrl from "@/app/components/JobUrl";

interface DataType {
  id: string;
  upworkId: string;
  title: string;
  description: string;
  industry: number;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Title",
    dataIndex: "title",
    render: (text, record) => <JobUrl title={text} upworkId={record.upworkId} />,
  },
  {
    title: "Industry",
    dataIndex: ["meta", "industry"],
    render: (industries) => (
      <Flex wrap="wrap" gap="small">
        {industries.map((industry: string, index: number) => (
          <Tag key={index}>{industry}</Tag>
        ))}
      </Flex>
    ),
  },
];

export default function IndustryAnalysisTable() {
  const { data: jobsWithMeta } = useQuery({
    queryKey: ["jobsWithMeta"],
    queryFn: getJobsWithMeta,
  });

  return (
    <Table<DataType>
      columns={columns}
      expandable={{
        expandedRowRender: (record) => (
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{record.description}</p>
        ),
        rowExpandable: (record) => !!record.description,
      }}
      dataSource={jobsWithMeta}
      rowKey="id"
      tableLayout="fixed"
    />
  );
}
