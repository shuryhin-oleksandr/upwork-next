import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetRef, TableProps } from "antd";
import { DatePicker, Form, Input, InputNumber, message, Table, theme } from "antd";
import { NamePath } from "antd/es/form/interface";
import TypographyText from "antd/es/typography/Text";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
import { createRoomMeta, getRooms, updateRoomMeta } from "./api";
import { FollowUpDate, MemoizedBantTag } from "./components";
import { EditableCellProps, EditableRowProps, Room } from "./interfaces";

const { TextArea } = Input;

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

type EditableType = "text" | "number" | "date";

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
      const newValue =
        editableType === "date"
          ? _.get(values, dataIndex)?.toISOString()
          : _.get(values, dataIndex);
      const originalValue = _.get(record, dataIndex);
      if (_.isEqual(originalValue, newValue)) {
        toggleEdit();
        return;
      }

      toggleEdit();

      const updatedValues = _.cloneDeep(values);
      if (_.isEqual(dataIndex, ["meta", "nextFollowUpDateCustom"])) {
        _.set(updatedValues, ["meta", "nextFollowUpDateCustomUpdatedAt"], new Date().toISOString());
      }
      handleSave(_.merge({}, record, updatedValues));
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item style={{ margin: 0 }} name={dataIndex}>
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
            onBlur={() => save()}
            style={{ width: "100%" }}
            format="D MMM YY"
            defaultOpen={true}
          />
        )}
        {editableType === "text" && (
          <TextArea ref={inputRef} onPressEnter={save} onBlur={save} autoSize />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        // style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const RoomsTable: React.FC = () => {
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const roomMetaCreateMutation = useMutation({
    mutationFn: createRoomMeta,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: ["rooms"] });
      const previousRooms = queryClient.getQueryData(["rooms"]);

      queryClient.setQueryData(["rooms"], (oldRooms: Room[]) =>
        oldRooms.map((room: Room) =>
          room.id === data.roomId ? _.merge({}, room, { meta: data }) : room
        )
      );
      return { previousRooms };
    },
    onSuccess: () => {
      messageApi.success("Data saved successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      messageApi.error(`Data save failed: ${errorMessage} !`);
      queryClient.setQueryData(["rooms"], context?.previousRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const roomMetaUpdateMutation = useMutation({
    mutationFn: updateRoomMeta,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: ["rooms"] });
      const previousRooms = queryClient.getQueryData(["rooms"]);

      queryClient.setQueryData(["rooms"], (oldRooms: Room[]) =>
        oldRooms.map((room: Room) =>
          room.meta?._id === data._id ? _.merge({}, room, { meta: data }) : room
        )
      );
      return { previousRooms };
    },
    onSuccess: () => {
      messageApi.success("Data saved successfully!");
    },
    onError: (error, _, context) => {
      const errorMessage = error?.response?.data?.message || error.message;
      messageApi.error(`Data save failed: ${errorMessage} !`);
      queryClient.setQueryData(["rooms"], context?.previousRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  if (isError) return <span>Error: {error.message}</span>;

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    editableType?: EditableType;
    dataIndex: NamePath<Room>;
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
      width: "33%",
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
        if (!record.nextFollowUpDate)
          return <TypographyText style={{ color: token.colorPrimary }}>NEW</TypographyText>;
        else {
          const followUpTypeSuffix =
            record.nextFollowUpDateType === "customUpdatedBeforeClientMessage" ? " ^" : " *";
          return (
            <FollowUpDate
              date={dayjs(record.nextFollowUpDate)}
              followUpIndicator={followUpTypeSuffix}
            />
          );
        }
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
      }),
    };
  });

  return (
    <div>
      {contextHolder}
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
        loading={isPending}
      />
    </div>
  );
};

export default RoomsTable;
