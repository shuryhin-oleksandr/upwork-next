import { createRoomMeta, getRooms, updateRoomMeta } from "@/app/api";
import { BantTag, MemoizedBantTag } from "@/app/components";
import { EditableCellProps, EditableRowProps, Room } from "@/app/interfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetRef, TableProps } from "antd";
import { Form, Input, InputNumber, message, Table, Tag } from "antd";
import { NamePath } from "antd/es/form/interface";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
import dayjs from 'dayjs';
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
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

type ColumnTypes = Exclude<TableProps<Room>["columns"], undefined>;

type EditableType = "text" | "number";

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
      form.setFieldValue(dataIndex, value);
    }
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      
      const newValue = _.get(values, dataIndex);
      const originalValue = _.get(record, dataIndex);
      if (_.isEqual(originalValue, newValue)) {
        toggleEdit();
        return;
      }

      toggleEdit();
      handleSave(_.merge({}, record, values));
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item style={{ margin: 0 }} name={dataIndex}>
        {editableType === "number" ? (
          <InputNumber
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            style={{ width: "100%" }}
            controls={false}
          />
        ) : (
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
      width: "20%",
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
    },
    {
      title: "Bant",
      dataIndex: ["meta", "bant"],
      width: "5%",
      editable: true,
      editableType: "number",
      sorter: (a, b) => (a.meta?.bant || 0) - (b.meta?.bant || 0),
      render: (value: number) => <MemoizedBantTag value={value} />,
    },
    {
      title: "Comment",
      dataIndex: ["meta", "comment"],
      width: "30%",
      editable: true,
      sorter: (a, b) => {
        const aHasComment = a.meta?.comment ? 1 : 0;
        const bHasComment = b.meta?.comment ? 1 : 0;
        return bHasComment - aHasComment;
      },
      defaultSortOrder: "ascend",
    },
    {
      title: "FU #",
      dataIndex: "nextFollowUpNumber",
      width: "5%",
      render: (value: number) =>
        value ? <Tag color="blue" style={{ marginRight: 0 }}>{`FU-${value}`}</Tag> : null,
    },
    {
      title: "FU date",
      dataIndex: "nextFollowUpDate",
      width: "10%",
      render: (value: string) => value && dayjs(value).format("D MMM YY"),
      sorter: (a, b) => {
        if (!a.nextFollowUpDate) return 1;
        if (!b.nextFollowUpDate) return -1;
        return dayjs(a.nextFollowUpDate).diff(dayjs(b.nextFollowUpDate));
      },
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
        }}
        size="small"
        loading={isPending}
      />
    </div>
  );
};

export default RoomsTable;
