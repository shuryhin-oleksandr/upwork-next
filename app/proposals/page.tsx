"use client";

import { EditableType, SelectOption } from "@/app/(home)/interfaces";
import { EditableCell, EditableRow } from "@/app/(home)/RoomsTable";
import { DATE_FORMAT } from "@/app/lib/constants";
import { createProposalMeta, getProposals, updateProposalMeta } from "@/app/proposals/api";
import { Proposal, ProposalStatus } from "@/app/proposals/interfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, DatePicker, Flex, Statistic, Table, TableProps } from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import { NamePath } from "antd/es/form/interface";
import TypographyText from "antd/es/typography/Text";
import dayjs from "dayjs";
import _ from "lodash";
import { useState } from "react";

const { RangePicker } = DatePicker;

enum JobStatus {
  Active = "ACTIVE",
  Closed = "CLOSED",
}

function BidStats({
  proposals = [],
  isLoading,
}: {
  proposals: Proposal[] | undefined;
  isLoading: boolean;
}) {
  const totalCount = proposals.length;

  const statusCounts: Record<string, number> = {};
  for (const status of Object.values(ProposalStatus)) {
    statusCounts[status] = proposals.filter((p) => p.status === status).length;
  }
  statusCounts["Total"] = totalCount;

  return (
    <Flex gap="large" justify="space-between">
      {Object.entries(statusCounts).map(([status, count]: [string, number]) => (
        <Statistic
          key={status}
          title={status}
          value={totalCount ? `${count} - ${Math.round((count / totalCount) * 100)}%` : "-"}
          style={{ textAlign: "center" }}
          loading={isLoading}
        />
      ))}
    </Flex>
  );
}

type ColumnTypes = Exclude<TableProps<Proposal>["columns"], undefined>;

function ProposalsTable({
  proposals,
  isLoading,
  queryKey,
}: {
  proposals: Proposal[] | undefined;
  isLoading: boolean;
  queryKey: string[] | string;
}) {
  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    editableType?: EditableType;
    dataIndex: NamePath<Proposal>;
    selectOptions?: SelectOption[];
  })[] = [
    {
      title: "Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text: string, record: Proposal) => (
        <a href={record.jobUrl} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    { title: "Upw status", dataIndex: "upworkStatus", key: "upworkStatus" },
    {
      title: "Date",
      dataIndex: "createdDateTime",
      key: "createdDateTime",
      render: (value: string) => (
        <TypographyText style={{ textWrap: "nowrap" }}>
          {dayjs(value).format(DATE_FORMAT)}
        </TypographyText>
      ),
    },
    {
      title: "Time",
      dataIndex: "createdDateTime",
      key: "createdTime",
      render: (value: string) => (
        <TypographyText style={{ textWrap: "nowrap" }}>
          {dayjs(value).format("HH:mm")}
        </TypographyText>
      ),
    },
    {
      title: "Interview",
      dataIndex: "totalInvitedToInterview",
      key: "totalInvitedToInterview",
      align: "center",
      render: (value: number) => (
        <TypographyText style={{ opacity: value ? 1 : 0.1 }}>{value}</TypographyText>
      ),
    },
    {
      title: "Hired",
      dataIndex: "totalHired",
      key: "totalHired",
      align: "center",
      render: (value: number) => (
        <TypographyText style={{ opacity: value ? 1 : 0.1 }}>{value}</TypographyText>
      ),
    },
    {
      title: "Available",
      dataIndex: "jobAvailability",
      key: "jobAvailability",
      align: "center",
      render: (value) => value != JobStatus.Active && "X",
    },
    {
      title: "Lead",
      dataIndex: "isLead",
      key: "isLead",
      align: "center",
      render: (value) => value && "+",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
    },
    {
      title: "Hired rate",
      dataIndex: ["meta", "hiredRate"],
      key: "hiredRate",
      align: "center",
      editable: true,
      editableType: "number",
      width: "7%",
    },
  ];

  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const proposalMetaCreateMutation = useMutation({
    mutationFn: createProposalMeta,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: ["proposals"] });
      const previousProposals = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldProposals: Proposal[]) =>
        oldProposals.map((oldProposal: Proposal) =>
          oldProposal.proposalId === data.proposalId
            ? _.merge({}, oldProposal, { meta: data })
            : oldProposal
        )
      );
      return { previousProposals };
    },
    onSuccess: () => {
      message.success("Room created successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(`Room creation failed: ${errorMessage} !`);
      queryClient.setQueryData(queryKey, context?.previousProposals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const proposalMetaUpdateMutation = useMutation({
    mutationFn: updateProposalMeta,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: ["proposals"] });
      const previousProposals = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldProposals: Proposal[]) =>
        oldProposals.map((proposal: Proposal) =>
          proposal.meta?._id === data._id ? _.merge({}, proposal, { meta: data }) : proposal
        )
      );
      return { previousProposals };
    },
    onSuccess: () => {
      message.success("Room updated successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(`Room update failed: ${errorMessage} !`);
      queryClient.setQueryData(queryKey, context?.previousProposals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const handleSave = (row: Proposal) => {
    if (!row.meta?._id)
      proposalMetaCreateMutation.mutate({ ...row.meta, proposalId: row.proposalId });
    else proposalMetaUpdateMutation.mutate(row.meta);
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Proposal) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        editableType: col.editableType,
        selectOptions: col.selectOptions,
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <Table<Proposal>
      components={components}
      rowClassName={() => "editable-row"}
      rowKey="proposalId"
      columns={columns}
      dataSource={proposals || []}
      pagination={false}
      loading={isLoading}
    />
  );
}

export default function Proposals() {
  type RangePickerValue = RangePickerProps["value"];
  const [dateRange, setDateRange] = useState<RangePickerValue>();
  const queryKey = ["proposals", dateRange];
  const {
    data: proposals,
    error,
    isLoading,
    refetch,
  } = useQuery<Proposal[]>({
    queryKey,
    queryFn: () => getProposals({ startDate: dateRange?.[0], endDate: dateRange?.[1] }),
    enabled: false,
  });
  if (error) return <div>Error loading proposals</div>;

  return (
    <div>
      <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates)} />
      <Button
        type="primary"
        onClick={() => refetch()}
        style={{ marginLeft: "1rem" }}
        disabled={!dateRange || !dateRange[0] || !dateRange[1]}
      >
        Analyze
      </Button>
      <Card style={{ marginTop: "2rem" }}>
        <BidStats {...{ proposals, isLoading }} />
      </Card>
      <Card style={{ marginTop: "2rem" }}>
        <ProposalsTable {...{ proposals, isLoading, queryKey }} />
      </Card>
    </div>
  );
}
