import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetRef, TableProps } from "antd";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Switch,
  Table,
  theme,
  Typography,
} from "antd";
import { NamePath } from "antd/es/form/interface";
import TypographyText from "antd/es/typography/Text";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { motion } from "framer-motion";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
import { createRoomMeta, getLossReasons, getRooms, updateRoomMeta } from "./api";
import { FollowUpDate, MemoizedBantTag } from "./components";
import {
  EditableCellProps,
  EditableRowProps,
  EditableType,
  LossReason,
  Room,
  SelectOption,
} from "./interfaces";

dayjs.extend(isSameOrAfter);

const { TextArea } = Input;
const { Text } = Typography;

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<Room> | null>(null);
// Index needed for compatibility with Antd Table public API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <motion.tr {...props} layout />
      </EditableContext.Provider>
    </Form>
  );
};

type ColumnTypes = Exclude<TableProps<Room>["columns"], undefined>;

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  // Index needed for compatibility with Antd Table public API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  editableType = "text",
  selectOptions,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    if (!editing) {
      const value = _.get(record, dataIndex);
      // TODO: Ratinalise conversion to Dayjs
      if (value && editableType === "date") {
        form.setFieldValue(dataIndex, dayjs(value));
      } else {
        form.setFieldValue(dataIndex, value);
      }
    }
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      let newValue = _.get(values, dataIndex);
      if (editableType === "date") newValue = newValue?.toISOString() ?? null;
      if (editableType === "select") newValue = newValue ?? null;
      const originalValue = _.get(record, dataIndex);

      toggleEdit();
      if (_.isEqual(originalValue, newValue)) {
        return;
      }

      const updatedRecord = _.set({ ...record }, dataIndex, newValue);
      handleSave(updatedRecord);
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item style={{ margin: 0 }} name={dataIndex}>
        {editableType === "select" && (
          <Select
            options={selectOptions}
            onChange={save}
            onDropdownVisibleChange={toggleEdit}
            defaultOpen={true}
            allowClear
          />
        )}
        {editableType === "number" && (
          <InputNumber
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            style={{ width: "100%" }}
            controls={false}
          />
        )}
        {editableType === "date" && (
          <DatePicker
            // TODO: Fix ref type
            ref={inputRef}
            onChange={() => save()}
            // onBlue fires before onChange, so it toggles input and prevents onChange 
            onOpenChange={(open) => !open && toggleEdit()}
            style={{ width: "100%" }}
            format="D MMM YY"
            defaultOpen
          />
        )}
        {editableType === "text" && (
          <TextArea ref={inputRef} onPressEnter={save} onBlur={save} autoSize />
        )}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" onClick={toggleEdit}>
        {/* Padding here needed to avoid jumping of select column (see select arrow width) */}
        <div style={{ padding: editableType === "select" ? "0 9px" : 0 }}>{children}</div>
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const RoomsTable: React.FC = () => {
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [excludeContracts, setExcludeContracts] = useState(true);

  const queryKey = ["rooms", excludeContracts];
  const { isPending, isError, data, error } = useQuery({
    queryKey,
    queryFn: () => getRooms({ excludeContracts }),
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

  const roomMetaCreateMutation = useMutation({
    mutationFn: createRoomMeta,
    onMutate: (data) => {
      queryClient.cancelQueries(["rooms"]);
      const previousRooms = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldRooms: Room[]) =>
        oldRooms.map((room: Room) =>
          room.id === data.roomId ? _.merge({}, room, { meta: data }) : room
        )
      );
      return { previousRooms };
    },
    onSuccess: () => {
      messageApi.success("Room created successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      messageApi.error(`Room creation failed: ${errorMessage} !`);
      queryClient.setQueryData(queryKey, context?.previousRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const roomMetaUpdateMutation = useMutation({
    mutationFn: updateRoomMeta,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: ["rooms"] });
      const previousRooms = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldRooms: Room[]) =>
        oldRooms.map((room: Room) =>
          room.meta?._id === data._id ? _.merge({}, room, { meta: data }) : room
        )
      );
      return { previousRooms };
    },
    onSuccess: () => {
      messageApi.success("Room updated successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      messageApi.error(`Room update failed: ${errorMessage} !`);
      queryClient.setQueryData(queryKey, context?.previousRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  if (isError) return <span>Error: {error.message}</span>;
  if (isLossReasonsError) return <span>Loss reasons error: {lossReasonsError.message}</span>;

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    editableType?: EditableType;
    dataIndex: NamePath<Room>;
    selectOptions?: SelectOption[];
  })[] = [
    {
      title: "Name",
      dataIndex: "roomName",
      width: "18%",
      render: (text: string, record: Room) => (
        <a href={record.url} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Topic",
      dataIndex: "topic",
      width: "30%",
      render: (topic: string, room: Room) =>
        room.jobUrl && (
          <a href={room.jobUrl} target="_blank" rel="noopener noreferrer">
            {topic}
          </a>
        ),
    },
    {
      title: "Bant",
      dataIndex: ["meta", "bant"],
      width: "5%",
      editable: true,
      editableType: "number",
      sorter: { multiple: 1, compare: (a, b) => (a.meta?.bant || 0) - (b.meta?.bant || 0) },
      sortDirections: ["descend"],
      render: (value: number) => <MemoizedBantTag value={value} />,
    },
    {
      title: "Comment",
      dataIndex: ["meta", "comment"],
      width: "28%",
      editable: true,
      sorter: {
        multiple: 2,
        compare: (a, b) => {
          const aHasComment = a.meta?.comment ? 1 : 0;
          const bHasComment = b.meta?.comment ? 1 : 0;
          return aHasComment - bHasComment;
        },
      },
      sortDirections: ["descend"],
    },
    {
      title: "FU#",
      dataIndex: "nextFollowUpNumber",
      width: "2%",
      align: "center",
      render: (value: number, record: Room) => (record.isContract ? null : value || null),
      sorter: {
        multiple: 4,
        compare: (a, b) => {
          if (a.isContract) return 1;
          if (b.isContract) return -1;

          const aDate = dayjs(a.nextFollowUpDate);
          const bDate = dayjs(b.nextFollowUpDate);
          const aShouldFollowUp = !aDate.isAfter(dayjs(), "day");
          const bShouldFollowUp = !bDate.isAfter(dayjs(), "day");

          if ((aShouldFollowUp && bShouldFollowUp) || (!aShouldFollowUp && !bShouldFollowUp)) {
            return a.nextFollowUpNumber - b.nextFollowUpNumber;
          } else if (aShouldFollowUp && !bShouldFollowUp) return -1;
          else if (!aShouldFollowUp && bShouldFollowUp) return 1;
          throw new Error("Unexpected state in FU# sorter");
        },
      },
      sortDirections: ["ascend"],
    },
    {
      title: "FU date",
      dataIndex: ["meta", "nextFollowUpDateCustom"],
      width: "12%",
      align: "center",
      editable: true,
      editableType: "date",
      render: (value: string, record: Room) => {
        if (record.isContract) return null;
        if (record.isFollowUpLimitExceeded) {
          return <TypographyText style={{ color: token.purple }}>HIDE</TypographyText>;
        }
        if (!record.nextFollowUpDate)
          return <TypographyText style={{ color: token.colorPrimary }}>NEW</TypographyText>;
        else
          return (
            <FollowUpDate
              date={dayjs(record.nextFollowUpDate)}
              asterix={!!record.nextFollowUpDateIsCustom}
            />
          );
      },
      sorter: {
        multiple: 1,
        compare: (a, b) => {
          if (a.isContract) return 1;
          if (b.isContract) return -1;
          if (!a.nextFollowUpDate) return -1;
          if (!b.nextFollowUpDate) return 1;
          return dayjs(a.nextFollowUpDate).diff(dayjs(b.nextFollowUpDate));
        },
      },
      defaultSortOrder: "ascend",
      sortDirections: ["ascend"],
    },
    {
      title: "Loss",
      dataIndex: ["meta", "lossReason"],
      width: "5%",
      align: "center",
      editable: true,
      editableType: "select",
      selectOptions: lossReasons?.map((reason) => ({
        label: reason.name,
        value: reason._id,
      })),
      render: (value) => (
        <Text style={{ textWrap: "nowrap" }}>
          {lossReasons?.find((reason) => reason._id === value)?.name}
        </Text>
      ),
    },
  ];

  const handleSave = (row: Room) => {
    if (!row.meta?._id) roomMetaCreateMutation.mutate({ ...row.meta, roomId: row.id });
    else roomMetaUpdateMutation.mutate(row.meta);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Room) => ({
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

  return (
    <div>
      {contextHolder}
      {/* TODO: Fix custom styles */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Switch
          checked={excludeContracts}
          onChange={() => setExcludeContracts(!excludeContracts)}
        />
        <Text style={{ marginLeft: "1rem" }}>Exclude contracts</Text>
      </div>
      <Table<Room>
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={data}
        columns={columns as ColumnTypes}
        rowKey={(record) => record.id}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: true,
          defaultPageSize: 50,
        }}
        size="small"
        loading={isPending || isLossReasonsPending}
        style={{ marginTop: "1.5rem" }}
      />
    </div>
  );
};

export default RoomsTable;
