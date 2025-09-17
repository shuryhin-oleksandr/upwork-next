"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Table, Typography } from "antd";
import { getLeads } from "./api";
import { LossReason } from "@/app/(home)/interfaces";
import { getLossReasons } from "@/app/(home)/api";

const { Text } = Typography;


export default function Leads() {
  const {
    data: leads,
    error,
    isPending,
  } = useQuery({
    queryKey: ["leads"],
    queryFn: getLeads,
  });

  const {
    data: lossReasons,
    isError: isLossReasonsError,
    error: lossReasonsError,
    isPending: isLossReasonsPending,
  } = useQuery<LossReason[]>({
    queryKey: ["loss-reasons"],
    queryFn: getLossReasons,
  });

  if (error) return <div>Error loading proposals</div>;
  if (isLossReasonsError) return <div>Loss reasons error: {lossReasonsError.message}</div>;

  const columns = [
    {
      title: "Room Name",
      dataIndex: "roomName",
    },
    {
      title: "Loss Reason",
      dataIndex: ["meta", "lossReason"],
      render: (value) => (
        <Text style={{ textWrap: "nowrap" }}>
          {lossReasons?.find((reason) => reason.id === value)?.name}
        </Text>
      ),
    },
  ];
  return (
    <Card>
      <Table
        dataSource={leads}
        columns={columns}
        loading={isPending || isLossReasonsPending}
        rowKey="id"
        size="small"
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: true,
          defaultPageSize: 50,
        }}
      />
    </Card>
  );
}
