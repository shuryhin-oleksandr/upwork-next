"use client";

import { useQuery } from "@tanstack/react-query";
import type { TableProps } from "antd";
import { Flex, Table, Tag, Typography } from "antd";
import { getJobsWithMeta } from "./api";
import JobUrl from "@/app/components/JobUrl";
import { useState } from "react";

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
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly string[]>([]);

  const { data: jobsWithMeta } = useQuery({
    queryKey: ["jobsWithMeta"],
    queryFn: getJobsWithMeta,
  });

  const handleExpand = (expanded: boolean, record: DataType) => {
    if (expanded) {
      setExpandedRowKeys([record.id]);
    } else {
      setExpandedRowKeys([]);
    }
  };

  return (
    <Table<DataType>
      columns={columns}
      expandable={{
        expandRowByClick: true,
        expandedRowKeys: expandedRowKeys,
        onExpand: handleExpand,
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
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {highlightKeywords(
                    record.description,
                    industryKeywordsInDescription,
                    techKeywordsInDescription
                  )}
                </Text>
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

// Helper function to highlight keyword combinations in text
function highlightKeywords(text: string, industryKeywords: string[], techKeywords: string[]) {
  if (!industryKeywords.length && !techKeywords.length) return text;

  // Combine all keywords and sort by length descending to match longer phrases first
  const allKeywords = [...industryKeywords, ...techKeywords].sort((a, b) => b.length - a.length);

  // Escape special regex characters
  const escapedKeywords = allKeywords.map((keyword) =>
    keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isIndustryKeyword = industryKeywords.some(
      (keyword) => keyword.toLowerCase() === part.toLowerCase()
    );
    const isTechKeyword = techKeywords.some(
      (keyword) => keyword.toLowerCase() === part.toLowerCase()
    );

 if (isIndustryKeyword) {
   return (
     <Text
       key={index}
       style={{
         backgroundColor: "#f6ffed",
         border: "1px solid #52c41a",
         borderRadius: "4px",
         padding: "0 2px",
       }}
     >
       {part}
     </Text>
   );
 } else if (isTechKeyword) {
   return (
     <Text
       key={index}
       style={{
         backgroundColor: "#e6f7ff",
         border: "1px solid #1890ff",
         borderRadius: "4px",
         padding: "0 2px",
       }}
     >
       {part}
     </Text>
   );
 }

    return part;
  });
}
