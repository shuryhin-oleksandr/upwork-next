import { NamePath } from "antd/es/form/interface";
import React from "react";

export interface Room {
  id: string;
  roomName: string;
  topic: string;
  meta: RoomMeta;
}

export interface CreateRoomMetaDto {
  roomId: string;
  comment: string;
}

export interface UpdateRoomMetaDto {
  _id: string;
  // TODO: roomId
  comment: string;
}

export interface RoomMeta {
  _id: string;
  roomId: string;
  comment: string;
}
export interface EditableRowProps {
  index: number;
}
export interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: NamePath<Room>;
  record: Room;
  handleSave: (record: Room) => void;
}
