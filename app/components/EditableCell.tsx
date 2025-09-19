import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
import { EditableContext } from "./EditableContext";
import { NamePath } from "antd/es/form/interface";
import { EditableType } from "@/app/components/interfaces";

const { TextArea } = Input;

export interface EditableCellProps<T> {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: NamePath<T>;
  record: T;
  handleSave: (record: T) => void;
  editableType?: EditableType;
  selectOptions?: { label: string; value: string }[];
}


export const EditableCell = <T extends object,>({
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
}: React.PropsWithChildren<EditableCellProps<T>>) => {
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
