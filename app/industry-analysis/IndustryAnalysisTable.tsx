"use client";

import { useQuery } from "@tanstack/react-query";
import type { TableProps } from "antd";
import { Table, Tag } from "antd";
import { getJobsWithMeta } from "./api";

interface DataType {
  id: string;
  title: string;
  industry: number;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Title",
    dataIndex: "title",
  },
  {
    title: "Industry",
    dataIndex: ["meta", "industry"],
    render: (industries) =>
      industries.map((industry: string, index: number) => <Tag key={index}>{industry}</Tag>),
  },
];

export default function IndustryAnalysisTable() {
  const { data: jobsWithMeta } = useQuery({
    queryKey: ["jobsWithMeta"],
    queryFn: getJobsWithMeta,
  });

  return <Table<DataType> columns={columns} dataSource={jobsWithMeta} rowKey="id" />;
}
