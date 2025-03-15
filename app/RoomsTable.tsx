import { createRoomMeta, getRooms, updateRoomMeta } from "@/app/api";
import { EditableRowProps, EditableCellProps, Room } from "@/app/interfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetRef, InputRef, TableProps } from "antd";
import { Form, Input, message, Table } from "antd";
import { NamePath } from "antd/es/form/interface";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
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

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  // Index needed for compatibility with Antd Table public API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    const value = _.get(record, dataIndex);
    form.setFieldValue(dataIndex, value);
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
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
        <TextArea ref={inputRef} onPressEnter={save} onBlur={save} autoSize />
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

type ColumnTypes = Exclude<TableProps<Room>["columns"], undefined>;

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

  if (isPending) return <span>Loading...</span>;
  if (isError) return <span>Error: {error.message}</span>;

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: NamePath<Room>;
  })[] = [
    {
      title: "Name",
      dataIndex: "roomName",
      width: "25%",
      editable: true,
    },
    {
      title: "Topic",
      dataIndex: "topic",
      width: "50%",
    },
    {
      title: "Action",
      dataIndex: ["meta", "action"],
      width: "25%",
      editable: true,
    },
  ];

  const handleSave = (row: Room) => {
    if (!row.meta?._id) roomMetaCreateMutation.mutate(row.meta);
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
      />
    </div>
  );
};

export default RoomsTable;
