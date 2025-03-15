import React from "react";

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}
export interface EditableRowProps {
  index: number;
}
export interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}
export interface Room {
  id: React.Key;
  roomName: string;
  topic: string;
  meta: RoomMeta;
}
export interface UpdateRoomMetaDto {
  action: string;
}
export interface RoomMeta {
  _id: string;
  action: string;
}
