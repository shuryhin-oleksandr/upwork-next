import { EditableCell } from "@/app/components/EditableCell";
import { EditableRow } from "@/app/components/EditableRow";
import type { TableProps } from "antd";
import { NamePath } from "antd/es/form/interface";
import { EditableType, SelectOption } from "./interfaces";

export type ColumnTypes<T> = Exclude<TableProps<T>["columns"], undefined>;

export type DefaultColumnType<T> = ColumnTypes<T>[number] & {
  editable?: boolean;
  dataIndex: NamePath<T>;
  editableType?: EditableType;
  selectOptions?: SelectOption[];
};

export default function makeColumns<T>(
  defaultColumns: DefaultColumnType<T>[],
  handleSave: (record: T) => void
) {
  return defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: T) => ({
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
}

export const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
};
