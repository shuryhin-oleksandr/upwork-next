"use client";

import { getLossReasons } from "@/app/(home)/api";
import { LossReason } from "@/app/(home)/interfaces";
import makeColumns, { ColumnTypes, components, DefaultColumnType } from "@/app/components/utils";
import { Lead } from "@/app/leads/interfaces";
import { DATE_FORMAT } from "@/app/lib/constants";
import { EyeInvisibleOutlined, MessageOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, DatePicker, Flex, Statistic, Table, theme, Typography } from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import _ from "lodash";
import { useState } from "react";
import { createRoomMeta, updateRoomMeta } from "@/app/lib/api";
import { getLeads } from "./api";
import { on } from "events";

const { Text } = Typography;
const { RangePicker } = DatePicker;

function LeadStats({ leads, lossReasons }: { leads?: Lead[]; lossReasons?: LossReason[] }) {
  const totalCount = leads?.length || 0;

  const hiddenLeads = leads?.filter((lead) => lead.hidden);
  const reasonMap = _.keyBy(lossReasons, "id");
  const countsById = _.countBy(hiddenLeads, (lead) => lead.meta?.lossReason ?? null);
  const countsByName = _.mapKeys(countsById, (count, id) => reasonMap[id]?.name ?? "Undefined");
  countsByName["Active"] = leads?.filter((lead) => !lead.hidden).length ?? 0;

  const oneOnOneCount = leads?.filter((lead) => lead.roomType === "ONE_ON_ONE").length ?? 0;
  if (oneOnOneCount > 0) countsByName["DM"] = oneOnOneCount;
  countsByName["Total"] = totalCount;
  return (
    <Flex gap="large">
      {Object.entries(countsByName).map(([lossReason, count]: [string, number]) => (
        <Statistic
          key={lossReason}
          title={lossReason}
          value={totalCount ? `${count} - ${Math.round((count / totalCount) * 100)}%` : "-"}
          style={{
            textAlign: "center",
            marginLeft: ["DM", "Total"].includes(lossReason) ? "auto" : undefined,
          }}
        />
      ))}
    </Flex>
  );
}

export default function Leads() {
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  type RangePickerValue = RangePickerProps["value"];
  const initialEndDate = dayjs();
  const initialStartDate = initialEndDate.subtract(4, "week").add(1, "day");
  const [dateRange, setDateRange] = useState<RangePickerValue>([initialStartDate, initialEndDate]);

  const {
    data: leads,
    error: leadsError,
    isFetching: isLeadsFetching,
    isLoading: isLeadsLoading,
    refetch: refetchLeads,
  } = useQuery<Lead[]>({
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

  const mainQueryKey = ["leads"];

  const roomMetaCreateMutation = useMutation({
    mutationFn: createRoomMeta,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: mainQueryKey });
      const previousRooms = queryClient.getQueryData(mainQueryKey);

      queryClient.setQueryData(mainQueryKey, (oldRooms: Lead[]) =>
        oldRooms.map((room: Lead) =>
          room.id === data.roomId ? _.merge({}, room, { meta: data }) : room
        )
      );
      return { previousRooms };
    },
    onSuccess: () => {
      message.success("Room created successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(`Room creation failed: ${errorMessage} !`);
      queryClient.setQueryData(mainQueryKey, context?.previousRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mainQueryKey });
    },
  });

  const roomMetaUpdateMutation = useMutation({
    mutationFn: updateRoomMeta,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: mainQueryKey });
      const previousRooms = queryClient.getQueryData(mainQueryKey);

      queryClient.setQueryData(mainQueryKey, (oldRooms: Lead[]) =>
        oldRooms.map((room: Lead) =>
          room.meta?.id === data.id ? _.merge({}, room, { meta: data }) : room
        )
      );
      return { previousRooms };
    },
    onSuccess: () => {
      message.success("Room updated successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(`Room update failed: ${errorMessage} !`);
      queryClient.setQueryData(mainQueryKey, context?.previousRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mainQueryKey });
    },
  });

  const handleSave = (row: Lead) => {
    if (!row.meta?.id) roomMetaCreateMutation.mutate({ ...row.meta, roomId: row.id });
    else roomMetaUpdateMutation.mutate(row.meta);
  };

  if (leadsError) return <div>Error loading leads</div>;
  if (isLossReasonsError) return <div>Loss reasons error: {lossReasonsError.message}</div>;

  const defaultColumns: DefaultColumnType<Lead>[] = [
    {
      title: "Room Name",
      dataIndex: "roomName",
    },
    {
      title: "Created",
      dataIndex: "createdAtDateTime",
      render: (value: string) => dayjs(value).format(DATE_FORMAT),
    },
    {
      title: "Source",
      dataIndex: "roomType",
      align: "center",
      render: (roomType: string) =>
        roomType == "ONE_ON_ONE" ? (
          <MessageOutlined style={{ color: token.colorTextDisabled }} />
        ) : null,
    },
    {
      title: "Status",
      dataIndex: "hidden",
      align: "center",
      render: (hidden: boolean) =>
        hidden && <EyeInvisibleOutlined style={{ color: token.colorTextDisabled }} />,
    },
    {
      title: "Loss Reason",
      dataIndex: ["meta", "lossReason"],
      align: "center",
      render: (value, record) =>
        value ? (
          <Text style={{ textWrap: "nowrap" }}>
            {lossReasons?.find((reason) => reason.id === value)?.name}
          </Text>
        ) : (
          record.hidden && "-"
        ),
      editable: false,
      editableType: "select",
      selectOptions: lossReasons?.map((reason) => ({ label: reason.name, value: reason.id })),
    },
  ];

  const columns = makeColumns<Lead>(defaultColumns, handleSave);

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
      {leads?.length && lossReasons?.length && (
        <Card style={{ marginTop: "2rem" }}>
          <LeadStats leads={leads} lossReasons={lossReasons} />
        </Card>
      )}
      <Card style={{ marginTop: "2rem" }}>
        <Table
          components={components}
          dataSource={leads}
          columns={columns as ColumnTypes<Lead>}
          loading={isLeadsLoading || isLossReasonsPending}
          rowKey="id"
          size="small"
          pagination={{
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            showSizeChanger: true,
            defaultPageSize: 50,
          }}
          rowClassName={() => "editable-row"}
        />
      </Card>
    </div>
  );
}
