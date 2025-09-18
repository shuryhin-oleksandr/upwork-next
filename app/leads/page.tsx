"use client";

import { getLossReasons } from "@/app/(home)/api";
import { LossReason } from "@/app/(home)/interfaces";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, DatePicker, Table, Typography } from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import { useState } from "react";
import { getLeads } from "./api";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function Leads() {
  type RangePickerValue = RangePickerProps["value"];
  const initialEndDate = dayjs()
  const initialStartDate = initialEndDate.subtract(4, "week").add(1, "day");
  const [dateRange, setDateRange] = useState<RangePickerValue>([initialStartDate, initialEndDate]);

  const {
    data: leads,
    error: leadsError,
    isFetching: isLeadsFetching,
    refetch: refetchLeads,
  } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeads(dateRange?.[0], dateRange?.[1]),
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

  if (leadsError) return <div>Error loading leads</div>;
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
    <div>
      <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates)} />
      <Button
        type="primary"
        onClick={() => refetchLeads()}
        style={{ marginLeft: "1rem" }}
        disabled={!dateRange || !dateRange[0] || !dateRange[1]}
        loading={isLeadsFetching}
      >
        Analyze
      </Button>
      <Card style={{ marginTop: "2rem" }}>
        <Table
          dataSource={leads}
          columns={columns}
          loading={isLeadsFetching || isLossReasonsPending}
          rowKey="id"
          size="small"
          pagination={{
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            showSizeChanger: true,
            defaultPageSize: 50,
          }}
        />
      </Card>
    </div>
  );
}
