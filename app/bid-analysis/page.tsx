"use client";

import { getBidStatistics } from "@/app/bid-analysis/api";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Statistic, Table, Typography } from "antd";

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

function BidStatystics() {
  const {
    data: jobs,
  } = useQuery({ queryKey: ["bid-statistics"], queryFn: getBidStatistics });

  if (!jobs) return null;

  const zeroRepliesJobsCount = jobs.filter((job) => job.interviewing === 0).length;
  const oneTwoRepliesJobsCount = jobs.filter(
    (job) => job.interviewing > 0 && job.interviewing <= 2
  ).length;
  const threePlusRepliesJobsCount = jobs.filter((job) => job.interviewing >= 3).length;
  const hiredJobsCount = jobs.filter((job) => job.hired > 0).length;
  return (
    <Row gutter={16}>
      <Col span={3}>
        <Card>
          <Statistic
            title="0 replies"
            value={(zeroRepliesJobsCount / jobs.length) * 100}
            suffix="%"
            precision={0}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card>
          <Statistic
            title="1-2 replies"
            value={(oneTwoRepliesJobsCount / jobs.length) * 100}
            suffix="%"
            precision={0}
          />
        </Card>
      </Col>
      <Col span={3}>
        <Card>
          <Statistic
            title="3+ replies"
            value={(threePlusRepliesJobsCount / jobs.length) * 100}
            suffix="%"
            precision={0}
          />
        </Card>
      </Col>
      <Col span={3} offset={12}>
        <Card>
          <Statistic
            title="Hired"
            value={(hiredJobsCount / jobs.length) * 100}
            suffix="%"
            precision={0}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default function BidAnalysis() {
  const {
    data: jobs,
    isPending,
    isError,
    error,
  } = useQuery({ queryKey: ["bid-statistics"], queryFn: getBidStatistics });

  if (isError) return <Text>Error: {error.message}</Text>;

  return (
    <>
      <BidStatystics />
      <Card style={jobs && { marginTop: "2rem" }}>
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
    </>
  );
}
