import { getRooms, updateRoomMeta } from "@/app/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetRef, InputRef, TableProps } from "antd";
import { Form, Input, Table } from "antd";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
const { TextArea } = Input;

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

interface EditableRowProps {
  index: number;
}

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

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
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
  const formFieldName = Array.isArray(dataIndex) ? dataIndex.join(".") : dataIndex;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const getNestedValue = (record: any, dataIndex: string | string[]) => {
    if (Array.isArray(dataIndex)) {
      return dataIndex.reduce((obj, key) => obj?.[key], record);
    }
    return record[dataIndex];
  };

  function convertDottedKeysToNested(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const keys = key.split(".");
        keys.reduce((acc, curr, idx) => {
          if (idx === keys.length - 1) {
            acc[curr] = obj[key];
          } else {
            if (!acc[curr]) {
              acc[curr] = {};
            }
            return acc[curr];
          }
          return acc;
        }, result);
      }
    }
    return result;
  }

  const toggleEdit = () => {
    setEditing(!editing);
    const initialValue = getNestedValue(record, dataIndex);
    form.setFieldsValue({ [formFieldName]: initialValue });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      const nestedValues = convertDottedKeysToNested(values);
      toggleEdit();
      handleSave(_.merge({}, record, nestedValues));
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={formFieldName}
      >
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

interface Room {
  id: React.Key;
  roomName: string;
  topic: string;
  meta: { _id: string; action: string };
}

type ColumnTypes = Exclude<TableProps<Room>["columns"], undefined>;

const RoomsTable: React.FC = () => {
  const queryClient = useQueryClient();
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
  const mutation = useMutation({
    mutationFn: updateRoomMeta,
    onSuccess: () => queryClient.invalidateQueries("rooms"),
  });

  const [dataSource, setDataSource] = useState<DataType[]>(data);
  useEffect(() => {
    if (data) {
      setDataSource(data);
    }
  }, [data]);

  if (isPending) return <span>Loading...</span>;
  if (isError) return <span>Error: {error.message}</span>;

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
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
    mutation.mutate({ id: row.meta._id, data: row.meta });
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
      <Table<Room>
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
        rowKey={(record) => record.id}
      />
    </div>
  );
};

export default RoomsTable;
