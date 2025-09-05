"use client";

import { useQuery } from "@tanstack/react-query";
import type { TableProps } from "antd";
import { Flex, Table, Tag, Typography } from "antd";
import { getJobsWithMeta } from "./api";
import JobUrl from "@/app/components/JobUrl";

const { Text } = Typography;

interface DataType {
  id: string;
  upworkId: string;
  title: string;
  description: string;
  industry: number;
  meta: {
    industry: string[];
    industryKeywords: string[];
    techStack: string[];
  };
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
        expandedRowRender: (record) => {
          const industryKeywordsInDescription = record.meta.industryKeywords.filter((keyword) =>
            record.description.toLowerCase().includes(keyword.toLowerCase())
          );

          const techKeywordsInDescription = record.meta.techStack.filter((keyword) =>
            record.description.toLowerCase().includes(keyword.toLowerCase())
          );

          return (
            <Flex gap={"large"} justify="space-between">
              <Flex vertical gap={"small"}>
                <Text strong>Job description</Text>
                <Text style={{ whiteSpace: "pre-wrap" }}>{record.description}</Text>
              </Flex>
              <Flex vertical gap={"large"}>
                <Flex vertical gap={"small"}>
                  <Text strong>Industry Keywords</Text>
                  {record.meta.industryKeywords.map((keyword, index) => (
                    <Tag
                      key={index}
                      color={industryKeywordsInDescription.includes(keyword) ? "green" : "default"}
                    >
                      {keyword}
                    </Tag>
                  ))}
                </Flex>
                <Flex vertical gap="small">
                  <Text strong>Tech Stack</Text>
                  {record.meta.techStack.map((keyword, index) => (
                    <Tag
                      key={index}
                      color={techKeywordsInDescription.includes(keyword) ? "blue" : "default"}
                    >
                      {keyword}
                    </Tag>
                  ))}
                </Flex>
              </Flex>
            </Flex>
          );
        },
        rowExpandable: (record) => !!record.description,
      }}
      dataSource={jobsWithMeta}
      rowKey="id"
      tableLayout="fixed"
    />
  );
}
